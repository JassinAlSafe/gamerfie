'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, Platform, Genre } from '@/types/game';

type FilterType = 'platform' | 'genre' | 'category' | 'year' | 'search' | 'sort';
type SortOption = 'popularity' | 'rating' | 'name' | 'release';
type CategoryOption = 'all' | 'recent' | 'popular' | 'upcoming' | 'classic';

interface GamesState {
  games: Game[];
  searchResults: Game[];
  isSearching: boolean;
  totalGames: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  platforms: Platform[];
  genres: Genre[];
  sortBy: SortOption;
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: CategoryOption;
  selectedYear: string;
  timeRange: string;
  hasActiveFilters: boolean;
  searchQuery: string;
  setGames: (games: Game[]) => void;
  setSearchResults: (results: Game[]) => void;
  setTotalGames: (total: number) => void;
  setTotalPages: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlatforms: (platforms: Platform[]) => void;
  setGenres: (genres: Genre[]) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCategory: (category: CategoryOption) => void;
  setSelectedYear: (year: string) => void;
  setTimeRange: (range: string) => void;
  setSearchQuery: (query: string) => void;
  searchGames: (query: string) => Promise<void>;
  removeFilter: (filterType: FilterType) => void;
  resetFilters: () => void;
  handleResetFilters: () => void;
  fetchMetadata: () => Promise<void>;
  fetchGames: () => Promise<void>;
  updateHasActiveFilters: () => void;
  batchUpdate: (updates: Partial<{
    selectedCategory: CategoryOption;
    selectedPlatform: string;
    selectedGenre: string;
    selectedYear: string;
    sortBy: SortOption;
    timeRange: string;
  }>) => void;
}

const DEFAULT_VALUES = {
  SORT: 'popularity' as SortOption,
  PLATFORM: 'all',
  GENRE: 'all',
  CATEGORY: 'all' as CategoryOption,
  YEAR: 'all',
  TIME_RANGE: 'all',
};

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      games: [],
      searchResults: [],
      isSearching: false,
      totalGames: 0,
      totalPages: 1,
      currentPage: 1,
      isLoading: false,
      error: null,
      platforms: [],
      genres: [],
      sortBy: DEFAULT_VALUES.SORT,
      selectedPlatform: DEFAULT_VALUES.PLATFORM,
      selectedGenre: DEFAULT_VALUES.GENRE,
      selectedCategory: DEFAULT_VALUES.CATEGORY,
      selectedYear: DEFAULT_VALUES.YEAR,
      timeRange: DEFAULT_VALUES.TIME_RANGE,
      hasActiveFilters: false,
      searchQuery: "",

      setGames: (games) => set({ games }),
      setSearchResults: (searchResults) => set({ searchResults }),
      setTotalGames: (totalGames) => set({ totalGames }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setPlatforms: (platforms) => set({ platforms }),
      setGenres: (genres) => set({ genres }),

      searchGames: async (query: string) => {
        if (query.trim().length < 2) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        set({ isSearching: true });
        try {
          const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Failed to search games');
          const data = await response.json();
          set({ searchResults: data.games || [], isSearching: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search games',
            searchResults: [],
            isSearching: false 
          });
        }
      },

      updateHasActiveFilters: () => {
        const state = get();
        const hasFilters = 
          state.selectedPlatform !== DEFAULT_VALUES.PLATFORM ||
          state.selectedGenre !== DEFAULT_VALUES.GENRE ||
          state.selectedCategory !== DEFAULT_VALUES.CATEGORY ||
          state.selectedYear !== DEFAULT_VALUES.YEAR ||
          state.searchQuery !== "" ||
          state.sortBy !== DEFAULT_VALUES.SORT;
        
        set({ hasActiveFilters: hasFilters });
      },

      setSearchQuery: (query) => {
        if (get().searchQuery === query) return;
        set({ searchQuery: query });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setSortBy: (sortBy) => {
        if (get().sortBy === sortBy) return;
        set({ sortBy });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setSelectedPlatform: (platform) => {
        if (get().selectedPlatform === platform) return;
        set({ selectedPlatform: platform });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setSelectedGenre: (genre) => {
        if (get().selectedGenre === genre) return;
        set({ selectedGenre: genre });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setSelectedCategory: (category) => {
        if (get().selectedCategory === category) return;
        set({ selectedCategory: category });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setSelectedYear: (year) => {
        if (get().selectedYear === year) return;
        set({ selectedYear: year });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      setTimeRange: (range) => {
        if (get().timeRange === range) return;
        set({ timeRange: range });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      removeFilter: (filterType) => {
        const updates: Partial<GamesState> = {};

        switch (filterType) {
          case 'platform':
            updates.selectedPlatform = DEFAULT_VALUES.PLATFORM;
            break;
          case 'genre':
            updates.selectedGenre = DEFAULT_VALUES.GENRE;
            break;
          case 'category':
            updates.selectedCategory = DEFAULT_VALUES.CATEGORY;
            break;
          case 'year':
            updates.selectedYear = DEFAULT_VALUES.YEAR;
            break;
          case 'search':
            updates.searchQuery = "";
            break;
          case 'sort':
            updates.sortBy = DEFAULT_VALUES.SORT;
            break;
        }

        set(updates);
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      },

      resetFilters: () => {
        set({
          sortBy: DEFAULT_VALUES.SORT,
          selectedPlatform: DEFAULT_VALUES.PLATFORM,
          selectedGenre: DEFAULT_VALUES.GENRE,
          selectedCategory: DEFAULT_VALUES.CATEGORY,
          selectedYear: DEFAULT_VALUES.YEAR,
          timeRange: DEFAULT_VALUES.TIME_RANGE,
          searchQuery: "",
          currentPage: 1,
          hasActiveFilters: false
        });
        get().fetchGames();
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
      },

      fetchGames: async () => {
        const state = get();
        try {
          set({ isLoading: true });
          
          const params = new URLSearchParams({
            page: state.currentPage.toString(),
            platform: state.selectedPlatform,
            genre: state.selectedGenre,
            category: state.selectedCategory,
            year: state.selectedYear,
            sort: state.sortBy,
            search: state.searchQuery
          });

          const response = await fetch(`/api/games?${params.toString()}`);
          if (!response.ok) {
            throw new Error('Failed to fetch games');
          }

          const data = await response.json();
          set({
            games: data.games,
            totalGames: data.totalGames,
            totalPages: data.totalPages,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch games',
            isLoading: false
          });
        }
      },

      batchUpdate: (updates) => {
        const hasChanges = Object.entries(updates).some(([key, value]) => {
          return get()[key as keyof typeof updates] !== value;
        });

        if (!hasChanges) return;

        set(updates);
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
        get().fetchGames();
      }
    }),
    {
      name: 'games-store',
      partialize: (state) => ({
        sortBy: state.sortBy,
        selectedPlatform: state.selectedPlatform,
        selectedGenre: state.selectedGenre,
        selectedCategory: state.selectedCategory,
        selectedYear: state.selectedYear,
        timeRange: state.timeRange,
        searchQuery: state.searchQuery,
        hasActiveFilters: state.hasActiveFilters
      })
    }
  )
); 