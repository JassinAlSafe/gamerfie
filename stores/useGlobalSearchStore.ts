import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameService } from '@/services/gameService';
import { GameExtended } from '@/types/gameService';

interface GlobalSearchState {
  query: string;
  results: GameExtended[];
  isLoading: boolean;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: GameExtended[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  search: (query: string) => Promise<void>;
  searchWithPagination: (params: {
    searchTerm: string;
    page: number;
    platformId: string;
    sortBy: string;
  }) => Promise<void>;
  reset: () => void;
}

const useGlobalSearchStoreImpl = create<GlobalSearchState>()(
  persist(
    (set) => ({
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
        if (query.length < 2) {
          set({ results: [], isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const results = await GameService.searchGames(query);
          set({ results, isLoading: false });
        } catch (error) {
          console.error('Search error:', error);
          set({ results: [], isLoading: false });
        }
      },
      searchWithPagination: async (params) => {
        if (params.searchTerm.length < 3) {
          set({ results: [], isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await GameService.fetchGames(params);
          set({ results: response.games });
        } catch (error) {
          console.error('Search error:', error);
          set({ results: [] });
        } finally {
          set({ isLoading: false });
        }
      },
      reset: () => set({ query: '', results: [], isLoading: false, isOpen: false }),
    }),
    {
      name: 'global-search-store',
    }
  )
);

// Export the enhanced store as both names for compatibility
export const useGlobalSearchStore = useGlobalSearchStoreImpl;
export const useSearchStore = useGlobalSearchStoreImpl;