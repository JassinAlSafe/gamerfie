/**
 * Comprehensive TypeScript interfaces for GamesHeader component
 * Provides type safety and clear contracts for all component interactions
 */

import { LucideIcon } from "lucide-react";
import { 
  SORT_OPTIONS, 
  VIEW_MODES, 
  QUICK_FILTER_RATINGS,
  QUICK_FILTER_YEARS,
  TIME_RANGE_OPTIONS,
  type SortValue,
  type ViewMode,
  type QuickFilterRating,
  type QuickFilterYear,
  type TimeRangeKey
} from "@/config/games-header-config";

// Base interfaces
export interface Platform {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  name: string;
  title?: string;
}

// Filter state interfaces
export interface FilterState {
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: string;
  selectedYear: string;
  timeRange: string;
  selectedGameMode: string;
  selectedTheme: string;
  minRating: number | null;
  maxRating: number | null;
  hasMultiplayer: boolean;
  sortBy: string;
  searchQuery: string;
}

export interface FilterActions {
  setSortBy: (sortBy: string) => void;
  setSelectedPlatform: (platform: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedYear: (year: string) => void;
  setTimeRange: (timeRange: string) => void;
  setSelectedGameMode: (gameMode: string) => void;
  setSelectedTheme: (theme: string) => void;
  setRatingRange: (min: number | null, max: number | null) => void;
  setHasMultiplayer: (hasMultiplayer: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

// Component props interfaces
export interface GamesHeaderProps {
  games?: Game[];
}

export interface HeaderNavigationProps {
  totalGames: number;
}

export interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  games: Game[];
  hasActiveFilters: boolean;
}

export interface FiltersSectionProps extends FilterState, FilterActions {
  platforms: Platform[];
  genres: Genre[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalGames: number;
  isQuickFiltersExpanded: boolean;
  setIsQuickFiltersExpanded: (expanded: boolean) => void;
  activeQuickFiltersCount: number;
  onClearQuickFilters: () => void;
}

export interface ActiveFiltersSectionProps {
  filterState: FilterState;
  filterActions: FilterActions;
  platforms: Platform[];
  genres: Genre[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export interface SortDropdownProps {
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

export interface QuickFiltersProps {
  filterState: FilterState;
  filterActions: FilterActions;
  platforms: Platform[];
  genres: Genre[];
  activeQuickFiltersCount: number;
  onClearQuickFilters: () => void;
}

export interface QuickFilterSectionProps {
  filterState: FilterState;
  filterActions: FilterActions;
  platforms?: Platform[];
  genres?: Genre[];
}

export interface ActiveFilterBadgeProps {
  type: string;
  label: string;
  value: any;
  onClear: () => void;
}

// Sort option interface
export interface SortOption {
  value: SortValue;
  label: string;
  icon: LucideIcon;
}

// Style interfaces
export interface QuickFilterButtonStyle {
  active: string;
  inactive: string;
}

export interface QuickFilterStyles {
  rating: QuickFilterButtonStyle;
  genre: QuickFilterButtonStyle;
  platform: QuickFilterButtonStyle;
  year: QuickFilterButtonStyle;
  multiplayer: QuickFilterButtonStyle;
}

// Filter badge interface
export interface FilterBadge {
  type: string;
  label: string;
  value: any;
  clearAction: () => Partial<FilterState>;
}

// Quick filter section configuration
export interface QuickFilterSection {
  icon: LucideIcon | string;
  label: string;
  values?: readonly (string | number)[];
  limit?: number;
  style: QuickFilterButtonStyle;
  includeMultiplayer?: boolean;
}

// Animation configuration
export interface AnimationConfig {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit: Record<string, any>;
  transition: Record<string, any>;
}

// Validation interfaces
export type FilterValidationResult = {
  isValid: boolean;
  errors?: string[];
};

export type FilterStateUpdate = Partial<FilterState>;

export type FilterEventHandler<T = any> = (value: T) => void;

export interface FilterEventHandlers {
  onRatingClick: FilterEventHandler<QuickFilterRating>;
  onGenreClick: FilterEventHandler<string>;
  onPlatformClick: FilterEventHandler<string>;
  onYearClick: FilterEventHandler<QuickFilterYear>;
  onMultiplayerToggle: FilterEventHandler<boolean>;
  onSearchChange: FilterEventHandler<string>;
  onSortChange: FilterEventHandler<SortValue>;
  onViewModeChange: FilterEventHandler<ViewMode>;
}

// Store integration interfaces
export interface GamesStoreState extends FilterState {
  platforms: Platform[];
  genres: Genre[];
  totalGames: number;
}

export interface GamesStoreActions extends FilterActions {
  resetFiltersAndUrl: () => void;
}

export interface UseGamesStore extends GamesStoreState, GamesStoreActions {}

// Component state interfaces
export interface GamesHeaderState {
  isQuickFiltersExpanded: boolean;
  activeQuickFiltersCount: number;
  hasActiveFilters: boolean;
}

export interface GamesHeaderHandlers extends FilterEventHandlers {
  onToggleQuickFilters: () => void;
  onClearQuickFilters: () => void;
  onResetAllFilters: () => void;
}

// Utility function return types
export interface RatingFilterResult {
  minRating: number | null;
  maxRating: number | null;
}

export interface PlatformDisplayInfo {
  name: string | null;
  shortName: string | null;
}

export interface GenreDisplayInfo {
  name: string | null;
}

// Component composition interfaces
export interface HeaderSection {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  order: number;
}

export interface GamesHeaderComposition {
  navigation: HeaderSection;
  search: HeaderSection;
  filters: HeaderSection;
  activeFilters: HeaderSection;
}

// Accessibility interfaces
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-expanded'?: boolean;
  role?: string;
  tabIndex?: number;
}

export interface FilterAccessibilityConfig {
  label: string;
  description?: string;
  instructions?: string;
}

// Error handling interfaces
export interface FilterError {
  type: 'validation' | 'network' | 'state';
  message: string;
  field?: keyof FilterState;
}

export type FilterErrorHandler = (error: FilterError) => void;

// Performance interfaces
export interface GamesHeaderPerformanceConfig {
  enableVirtualization: boolean;
  debounceMs: number;
  cacheSize: number;
  lazyLoad: boolean;
}

// Theme/styling interfaces
export interface GamesHeaderTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// Export discriminated unions for type safety
export type FilterValue = 
  | { type: 'string'; value: string }
  | { type: 'number'; value: number | null }
  | { type: 'boolean'; value: boolean }
  | { type: 'array'; value: string[] };

export type FilterAction =
  | { type: 'SET_SORT'; payload: SortValue }
  | { type: 'SET_PLATFORM'; payload: string }
  | { type: 'SET_GENRE'; payload: string }
  | { type: 'SET_YEAR'; payload: string }
  | { type: 'SET_RATING'; payload: RatingFilterResult }
  | { type: 'SET_MULTIPLAYER'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'CLEAR_QUICK_FILTERS' };

export type ComponentVariant = 
  | 'compact'
  | 'expanded' 
  | 'mobile'
  | 'desktop';

export type FilterDisplayMode =
  | 'pills'
  | 'dropdown'
  | 'chips'
  | 'list';