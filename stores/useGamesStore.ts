import { create } from 'zustand';
import { Game, Platform, Genre } from '@/types/game';

interface GamesState {
  games: Game[];
  totalGames: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  platforms: Platform[];
  genres: Genre[];
  sortBy: string;
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: string;
  selectedYear: string;
  timeRange: string;
  hasActiveFilters: boolean;
  searchQuery: string;
  setGames: (games: Game[]) => void;
  setTotalGames: (total: number) => void;
  setTotalPages: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlatforms: (platforms: Platform[]) => void;
  setGenres: (genres: Genre[]) => void;
  setSortBy: (sort: string) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedYear: (year: string) => void;
  setTimeRange: (range: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  handleResetFilters: () => void;
  fetchMetadata: () => Promise<void>;
}

export const useGamesStore = create<GamesState>((set, get) => ({
  games: [],
  totalGames: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
  platforms: [],
  genres: [],
  sortBy: "popularity",
  selectedPlatform: "all",
  selectedGenre: "all",
  selectedCategory: "all",
  selectedYear: "all",
  timeRange: "all",
  hasActiveFilters: false,
  searchQuery: "",

  setGames: (games) => set({ games }),
  setTotalGames: (totalGames) => set({ totalGames }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPlatforms: (platforms) => set({ platforms }),
  setGenres: (genres) => set({ genres }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTimeRange: (range) => set({ timeRange: range }),
  setSortBy: (sortBy) => {
    set({ 
      sortBy,
      hasActiveFilters: sortBy !== "popularity" || get().hasActiveFilters
    });
    get().setCurrentPage(1);
  },
  setSelectedPlatform: (platform) => {
    set({ 
      selectedPlatform: platform,
      hasActiveFilters: platform !== "all" || get().hasActiveFilters
    });
    get().setCurrentPage(1);
  },
  setSelectedGenre: (genre) => {
    set({ 
      selectedGenre: genre,
      hasActiveFilters: genre !== "all" || get().hasActiveFilters
    });
    get().setCurrentPage(1);
  },
  setSelectedCategory: (category) => {
    set({ 
      selectedCategory: category,
      hasActiveFilters: category !== "all" || get().hasActiveFilters
    });
    get().setCurrentPage(1);
  },
  setSelectedYear: (year) => {
    set({ 
      selectedYear: year,
      hasActiveFilters: year !== "all" || get().hasActiveFilters
    });
    get().setCurrentPage(1);
  },
  resetFilters: () => {
    set({
      sortBy: "popularity",
      selectedPlatform: "all",
      selectedGenre: "all",
      selectedCategory: "all",
      selectedYear: "all",
      currentPage: 1,
      hasActiveFilters: false
    });
  },
  handleResetFilters: () => {
    get().resetFilters();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  fetchMetadata: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/games/metadata');
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const data = await response.json();
      set({
        platforms: data.platforms || [],
        genres: data.genres || [],
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch metadata',
        isLoading: false
      });
    }
  }
})); 