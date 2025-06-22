import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Game, 
  Platform, 
  Genre, 
  FilterType, 
  SortOption, 
  CategoryOption,
  GameFilterUpdate,
  TimeRange
} from '@/types';

interface GamesState {
  // From GameFilterState
  sortBy: SortOption;
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: CategoryOption;
  selectedYear: string;
  timeRange: TimeRange;
  searchQuery: string;
  
  // Enhanced filtering options
  selectedGameMode: string;
  selectedTheme: string;
  minRating: number | null;
  maxRating: number | null;
  hasMultiplayer: boolean;
  
  // From GamePaginationState
  currentPage: number;
  totalPages: number;
  totalGames: number;
  
  // Own properties
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
  setSelectedGameMode: (gameMode: string) => void;
  setSelectedTheme: (theme: string) => void;
  setRatingRange: (min: number | null, max: number | null) => void;
  setHasMultiplayer: (hasMultiplayer: boolean) => void;
  
  // Filter management
  updateFilter: (filterType: keyof GamesState, value: any) => void;
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
  GAME_MODE: 'all',
  THEME: 'all',
  MIN_RATING: null as number | null,
  MAX_RATING: null as number | null,
  HAS_MULTIPLAYER: false,
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
      selectedGameMode: DEFAULT_VALUES.GAME_MODE,
      selectedTheme: DEFAULT_VALUES.THEME,
      minRating: DEFAULT_VALUES.MIN_RATING,
      maxRating: DEFAULT_VALUES.MAX_RATING,
      hasMultiplayer: DEFAULT_VALUES.HAS_MULTIPLAYER,
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
          state.timeRange !== DEFAULT_VALUES.TIME_RANGE ||
          state.selectedGameMode !== DEFAULT_VALUES.GAME_MODE ||
          state.selectedTheme !== DEFAULT_VALUES.THEME ||
          state.minRating !== DEFAULT_VALUES.MIN_RATING ||
          state.maxRating !== DEFAULT_VALUES.MAX_RATING ||
          state.hasMultiplayer !== DEFAULT_VALUES.HAS_MULTIPLAYER ||
          state.searchQuery !== "" ||
          state.sortBy !== DEFAULT_VALUES.SORT;
        
        set({ hasActiveFilters: hasFilters });
      },

      // Individual filter setters with consistent pattern
      setSearchQuery: (query) => {
        if (get().searchQuery === query) return;
        set({ searchQuery: query });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSortBy: (sortBy) => {
        if (get().sortBy === sortBy) return;
        set({ sortBy });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedPlatform: (platform) => {
        if (get().selectedPlatform === platform) return;
        set({ selectedPlatform: platform });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedGenre: (genre) => {
        if (get().selectedGenre === genre) return;
        set({ selectedGenre: genre });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedCategory: (category) => {
        if (get().selectedCategory === category) return;
        set({ selectedCategory: category });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedYear: (year) => {
        if (get().selectedYear === year) return;
        set({ selectedYear: year });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setTimeRange: (range) => {
        if (get().timeRange === range) return;
        set({ timeRange: range });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedGameMode: (gameMode) => {
        if (get().selectedGameMode === gameMode) return;
        set({ selectedGameMode: gameMode });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setSelectedTheme: (theme) => {
        if (get().selectedTheme === theme) return;
        set({ selectedTheme: theme });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setHasMultiplayer: (hasMultiplayer) => {
        if (get().hasMultiplayer === hasMultiplayer) return;
        set({ hasMultiplayer });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      // Common filter update pattern - helper method
      updateFilter: (filterType: keyof GamesState, value: any) => {
        const currentValue = get()[filterType];
        if (currentValue === value) return;
        
        set({ [filterType]: value });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      setRatingRange: (min, max) => {
        const state = get();
        if (state.minRating === min && state.maxRating === max) return;
        set({ minRating: min, maxRating: max });
        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      removeFilter: (filterType) => {
        const filterMap: Record<FilterType, keyof GamesState> = {
          platform: 'selectedPlatform',
          genre: 'selectedGenre', 
          category: 'selectedCategory',
          year: 'selectedYear',
          timeRange: 'timeRange',
          gameMode: 'selectedGameMode',
          theme: 'selectedTheme',
          search: 'searchQuery',
          sort: 'sortBy',
          rating: 'minRating', // Special case - will handle both min/max
          multiplayer: 'hasMultiplayer'
        };

        const defaultMap: Record<FilterType, any> = {
          platform: DEFAULT_VALUES.PLATFORM,
          genre: DEFAULT_VALUES.GENRE,
          category: DEFAULT_VALUES.CATEGORY,
          year: DEFAULT_VALUES.YEAR,
          timeRange: DEFAULT_VALUES.TIME_RANGE,
          gameMode: DEFAULT_VALUES.GAME_MODE,
          theme: DEFAULT_VALUES.THEME,
          search: '',
          sort: DEFAULT_VALUES.SORT,
          rating: null,
          multiplayer: DEFAULT_VALUES.HAS_MULTIPLAYER
        };

        if (filterType === 'rating') {
          set({ minRating: null, maxRating: null });
        } else {
          const stateKey = filterMap[filterType];
          const defaultValue = defaultMap[filterType];
          set({ [stateKey]: defaultValue });
        }

        get().updateHasActiveFilters();
        get().setCurrentPage(1);
      },

      resetFilters: () => {
        set({
          sortBy: DEFAULT_VALUES.SORT,
          selectedPlatform: DEFAULT_VALUES.PLATFORM,
          selectedGenre: DEFAULT_VALUES.GENRE,
          selectedCategory: DEFAULT_VALUES.CATEGORY,
          selectedYear: DEFAULT_VALUES.YEAR,
          timeRange: DEFAULT_VALUES.TIME_RANGE,
          selectedGameMode: DEFAULT_VALUES.GAME_MODE,
          selectedTheme: DEFAULT_VALUES.THEME,
          minRating: DEFAULT_VALUES.MIN_RATING,
          maxRating: DEFAULT_VALUES.MAX_RATING,
          hasMultiplayer: DEFAULT_VALUES.HAS_MULTIPLAYER,
          searchQuery: "",
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
            timeRange: state.timeRange,
            gameMode: state.selectedGameMode,
            theme: state.selectedTheme,
            sort: state.sortBy,
            search: state.searchQuery,
            multiplayer: state.hasMultiplayer.toString()
          });

          // Add rating filters if set
          if (state.minRating !== null) {
            params.set('minRating', state.minRating.toString());
          }
          if (state.maxRating !== null) {
            params.set('maxRating', state.maxRating.toString());
          }

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
      }
    }),
    {
      name: 'games-store-v2', // Updated to reset persisted state
      partialize: (state) => ({
        sortBy: state.sortBy,
        selectedPlatform: state.selectedPlatform,
        selectedGenre: state.selectedGenre,
        selectedCategory: state.selectedCategory,
        selectedYear: state.selectedYear,
        timeRange: state.timeRange,
        selectedGameMode: state.selectedGameMode,
        selectedTheme: state.selectedTheme,
        minRating: state.minRating,
        maxRating: state.maxRating,
        hasMultiplayer: state.hasMultiplayer,
        searchQuery: state.searchQuery,
        hasActiveFilters: state.hasActiveFilters
      })
    }
  )
);