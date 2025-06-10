import { create } from 'zustand';
import { Game } from '@/types';

interface ExploreSearchState {
  query: string;
  setQuery: (query: string) => void;
  results: Game[];
  isLoading: boolean;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export const useExploreSearchStore = create<ExploreSearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  setQuery: (query) => set({ query }),
  search: async (query) => {
    if (query.length < 2) {
      set({ results: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      set({ results: data, isLoading: false });
    } catch (error) {
      set({ results: [], isLoading: false });
    }
  },
  reset: () => set({ query: '', results: [], isLoading: false }),
}));
