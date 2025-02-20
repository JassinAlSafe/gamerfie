import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Game, 
  Platform, 
  Genre, 
  FilterType, 
  SortOption, 
  CategoryOption,
  GameFilterState,
  GamePaginationState,
  GameFilterUpdate,
  TimeRange
} from '@/types/game';

interface GamesState extends GameFilterState, GamePaginationState {
  games: Game[];
  error: string | null;
  platforms: Platform[];
  genres: Genre[];
  hasActiveFilters: boolean;
  
  // State setters
  setGames: (games: Game[]) => void;
  setTotalGames: (total: number) => void;
  setTotalPages: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setError: (error: string | null) => void;
  setPlatforms: (platforms: Platform[]) => void;
  setGenres: (genres: Genre[]) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCategory: (category: CategoryOption) => void;
  setSelectedYear: (year: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setSearchQuery: (query: string) => void;
  
  // Filter management
  removeFilter: (filterType: FilterType) => void;
  resetFilters: () => void;
  handleResetFilters: () => void;
  updateHasActiveFilters: () => void;
  
  // Data fetching
  fetchMetadata: () => Promise<void>;
  fetchGames: () => Promise<void>;
  batchUpdate: (updates: GameFilterUpdate) => void;
}

const DEFAULT_VALUES = {
  SORT: 'popularity' as SortOption,
  PLATFORM: 'all',
  GENRE: 'all',
  CATEGORY: 'all' as CategoryOption,
  YEAR: 'all',
  TIME_RANGE: 'all' as TimeRange,
};

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      games: [],
      totalGames: 0,
      totalPages: 1,
      currentPage: 1,
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
      setTotalGames: (totalGames) => set({ totalGames }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setError: (error) => set({ error }),
      setPlatforms: (platforms) => set({ platforms }),
      setGenres: (genres) => set({ genres }),

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
          const response = await fetch('/api/games/metadata');
          if (!response.ok) {
            throw new Error('Failed to fetch metadata');
          }
          const data = await response.json();
          set({
            platforms: data.platforms || [],
            genres: data.genres || []
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch metadata'
          });
        }
      },

      fetchGames: async () => {
        const state = get();
        try {
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
            error: null
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch games'
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