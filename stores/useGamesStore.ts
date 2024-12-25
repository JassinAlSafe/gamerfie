import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game } from '@/types/game';

interface GamesState {
  games: Game[];
  currentPage: number;
  totalPages: number;
  totalGames: number;
  sortBy: 'rating' | 'popularity' | 'name' | 'release';
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: string;
  selectedYear: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setGames: (games: Game[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalGames: (total: number) => void;
  setSortBy: (sort: 'rating' | 'popularity' | 'name' | 'release') => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedYear: (year: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useGamesStore = create<GamesState>()(
  persist(
    (set) => ({
      games: [],
      currentPage: 1,
      totalPages: 1,
      totalGames: 0,
      sortBy: 'rating',
      selectedPlatform: 'all',
      selectedGenre: 'all',
      selectedCategory: 'all',
      selectedYear: 'all',
      searchQuery: '',
      isLoading: false,
      error: null,

      // Actions
      setGames: (games) => set({ games }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (pages) => set({ totalPages: pages }),
      setTotalGames: (total) => set({ totalGames: total }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      resetFilters: () => set({
        selectedPlatform: 'all',
        selectedGenre: 'all',
        selectedCategory: 'all',
        selectedYear: 'all',
        searchQuery: '',
        currentPage: 1
      })
    }),
    {
      name: 'games-storage',
      partialize: (state) => ({
        sortBy: state.sortBy,
        selectedPlatform: state.selectedPlatform,
        selectedGenre: state.selectedGenre,
        selectedCategory: state.selectedCategory,
        selectedYear: state.selectedYear
      })
    }
  )
); 