import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game } from '@/types/game';
import { GameService } from '@/services/gameService';

interface GlobalSearchState {
  query: string;
  results: Game[];
  isLoading: boolean;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: Game[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export const useGlobalSearchStore = create<GlobalSearchState>()(
  persist(
    (set) => ({
      query: '',
      results: [],
      isLoading: false,
      isOpen: false,
      setQuery: (query) => set({ query }),
      setResults: (results) => set({ results }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsOpen: (isOpen) => set({ isOpen }),
      search: async (query) => {
        if (query.length < 2) {
          set({ results: [], isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const results = await GameService.searchGames(query);
          set({ results, isLoading: false });
        } catch (error) {
          console.error('Failed to search:', error);
          set({ results: [], isLoading: false });
        }
      },
      reset: () => set({ query: '', results: [], isLoading: false, isOpen: false }),
    }),
    {
      name: 'global-search-store',
    }
  )
);