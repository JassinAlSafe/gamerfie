import { create } from 'zustand';
import { GameService } from '@/services/gameService';
import { GameExtended } from '@/types/gameService';

interface SearchState {
  query: string;
  results: GameExtended[];
  isLoading: boolean;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: GameExtended[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  isOpen: false,
  setQuery: (query) => {
    set({ query });
    if (query.length === 0) {
      set({ results: [] });
    }
  },
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsOpen: (isOpen) => set({ isOpen }),
  search: async (query) => {
    if (query.length < 3) {
      set({ results: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await GameService.fetchGames({
        searchTerm: query,
        page: 1,
        platformId: 'all',
        sortBy: 'popularity'
      });
      set({ results: response.games });
    } catch (error) {
      console.error('Search error:', error);
      set({ results: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set({ query: '', results: [], isLoading: false, isOpen: false }),
})); 