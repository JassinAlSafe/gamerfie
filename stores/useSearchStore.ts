'use client';

import { create } from 'zustand';
import { Game } from '@/types/game';

interface SearchState {
  query: string;
  results: Game[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setResults: (results: Game[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOpen: (open: boolean) => void;
  search: (query: string) => Promise<void>;
  executeSearch: (query: string) => Promise<void>;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isLoading: false,
  isOpen: false,
  error: null,

  setQuery: (query) => {
    set({ query });
    if (!query) {
      set({ isOpen: false, results: [] });
    }
  },

  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOpen: (isOpen) => set({ isOpen }),

  search: async (query: string) => {
    if (query.trim().length < 2) {
      set({ results: [], isLoading: false, isOpen: false });
      return;
    }

    set({ isLoading: true, isOpen: true });
    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) throw new Error('Failed to search games');
      const data = await response.json();
      set({ 
        results: data.games || [], 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search games',
        results: [],
        isLoading: false 
      });
    }
  },

  executeSearch: async (query: string) => {
    set({ query, isOpen: false });
    await get().search(query);
  },

  reset: () => {
    set({
      query: '',
      results: [],
      isLoading: false,
      isOpen: false,
      error: null
    });
  }
})); 