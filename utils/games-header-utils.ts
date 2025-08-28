/**
 * Pure utility functions for GamesHeader component
 * Handles all business logic with no side effects
 */

import { 
  FILTER_DEFAULTS,
  SORT_OPTIONS,
  TIME_RANGE_OPTIONS,
  PLATFORM_NAME_MAPPING,
  FILTER_STATE_KEYS,
  type SortValue,
  type TimeRangeKey,
  type QuickFilterRating
} from "@/config/games-header-config";

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

export interface Platform {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
}

export function convertUIRatingToIGDB(uiRating: number): number {
  return uiRating * FILTER_DEFAULTS.RATING_MULTIPLIER;
}

export function convertIGDBRatingToUI(igdbRating: number): number {
  return igdbRating / FILTER_DEFAULTS.RATING_MULTIPLIER;
}

export function getSortIcon(sortBy: string) {
  const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
  return sortOption ? sortOption.icon : SORT_OPTIONS[0].icon;
}

export function isFilterActive(
  filterState: FilterState
): boolean {
  return FILTER_STATE_KEYS.some(key => {
    const value = filterState[key];
    
    if (key === 'sortBy') {
      return value !== FILTER_DEFAULTS.SORT_BY;
    }
    
    if (key === 'searchQuery') {
      return value !== FILTER_DEFAULTS.SEARCH_QUERY;
    }
    
    if (key === 'minRating' || key === 'maxRating') {
      return value !== null;
    }
    
    if (key === 'hasMultiplayer') {
      return value !== FILTER_DEFAULTS.HAS_MULTIPLAYER;
    }
    
    return value !== FILTER_DEFAULTS.ALL;
  });
}

export function countActiveQuickFilters(
  filterState: FilterState
): number {
  const activeFilters = [
    filterState.minRating !== null,
    filterState.selectedGenre !== FILTER_DEFAULTS.ALL,
    filterState.selectedPlatform !== FILTER_DEFAULTS.ALL,
    filterState.selectedYear !== FILTER_DEFAULTS.ALL,
    filterState.hasMultiplayer
  ];
  
  return activeFilters.filter(Boolean).length;
}

export function getPlatformDisplayName(
  platformId: string,
  platforms: Platform[]
): string | null {
  if (platformId === FILTER_DEFAULTS.ALL) return null;
  
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || null;
}

export function getGenreDisplayName(
  genreId: string,
  genres: Genre[]
): string | null {
  if (genreId === FILTER_DEFAULTS.ALL) return null;
  
  const genre = genres.find(g => g.id === genreId);
  return genre?.name || null;
}

export function getSortDisplayLabel(sortValue: string): string {
  const sortOption = SORT_OPTIONS.find(option => option.value === sortValue);
  return sortOption?.label || "Sort By";
}

export function getTimeRangeDisplayLabel(timeRange: string): string {
  return TIME_RANGE_OPTIONS[timeRange as TimeRangeKey] || timeRange;
}

export function shortenPlatformName(platformName: string): string {
  for (const [original, shortened] of Object.entries(PLATFORM_NAME_MAPPING)) {
    if (platformName.includes(original)) {
      return platformName.replace(original, shortened);
    }
  }
  return platformName;
}

export function isRatingFilterActive(
  currentMinRating: number | null,
  uiRating: QuickFilterRating
): boolean {
  const igdbRating = convertUIRatingToIGDB(uiRating);
  return currentMinRating === igdbRating;
}

export function toggleRatingFilter(
  currentMinRating: number | null,
  uiRating: QuickFilterRating
): { minRating: number | null; maxRating: number | null } {
  const igdbRating = convertUIRatingToIGDB(uiRating);
  
  if (currentMinRating === igdbRating) {
    return {
      minRating: FILTER_DEFAULTS.MIN_RATING,
      maxRating: FILTER_DEFAULTS.MAX_RATING
    };
  }
  
  return {
    minRating: igdbRating,
    maxRating: FILTER_DEFAULTS.MAX_RATING
  };
}

export function toggleGenreFilter(
  currentGenre: string,
  genreId: string
): string {
  return currentGenre === genreId ? FILTER_DEFAULTS.ALL : genreId;
}

export function togglePlatformFilter(
  currentPlatform: string,
  platformId: string
): string {
  return currentPlatform === platformId ? FILTER_DEFAULTS.ALL : platformId;
}

export function toggleYearFilter(
  currentYear: string,
  year: string
): string {
  return currentYear === year ? FILTER_DEFAULTS.ALL : year;
}

export function clearQuickFilters(): Partial<FilterState> {
  return {
    minRating: FILTER_DEFAULTS.MIN_RATING,
    maxRating: FILTER_DEFAULTS.MAX_RATING,
    selectedGenre: FILTER_DEFAULTS.ALL,
    selectedPlatform: FILTER_DEFAULTS.ALL,
    selectedYear: FILTER_DEFAULTS.ALL,
    hasMultiplayer: FILTER_DEFAULTS.HAS_MULTIPLAYER
  };
}

export function validateFilterValue(
  filterKey: keyof FilterState,
  value: any
): boolean {
  switch (filterKey) {
    case 'sortBy':
      return SORT_OPTIONS.some(option => option.value === value);
    
    case 'minRating':
    case 'maxRating':
      return value === null || (typeof value === 'number' && value >= 0 && value <= 100);
    
    case 'hasMultiplayer':
      return typeof value === 'boolean';
    
    case 'searchQuery':
      return typeof value === 'string';
    
    default:
      return typeof value === 'string';
  }
}

export function getActiveFilterBadges(
  filterState: FilterState,
  platforms: Platform[],
  genres: Genre[]
): Array<{
  type: string;
  label: string;
  value: any;
  clearAction: () => Partial<FilterState>;
}> {
  const badges = [];
  
  // Platform filter
  const platformName = getPlatformDisplayName(filterState.selectedPlatform, platforms);
  if (platformName) {
    badges.push({
      type: 'platform',
      label: platformName,
      value: filterState.selectedPlatform,
      clearAction: () => ({ selectedPlatform: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Genre filter
  const genreName = getGenreDisplayName(filterState.selectedGenre, genres);
  if (genreName) {
    badges.push({
      type: 'genre',
      label: genreName,
      value: filterState.selectedGenre,
      clearAction: () => ({ selectedGenre: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Year filter
  if (filterState.selectedYear !== FILTER_DEFAULTS.ALL) {
    badges.push({
      type: 'year',
      label: filterState.selectedYear,
      value: filterState.selectedYear,
      clearAction: () => ({ selectedYear: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Time range filter
  if (filterState.timeRange !== FILTER_DEFAULTS.ALL) {
    badges.push({
      type: 'timeRange',
      label: getTimeRangeDisplayLabel(filterState.timeRange),
      value: filterState.timeRange,
      clearAction: () => ({ timeRange: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Game mode filter
  if (filterState.selectedGameMode !== FILTER_DEFAULTS.ALL) {
    badges.push({
      type: 'gameMode',
      label: `Game Mode: ${filterState.selectedGameMode}`,
      value: filterState.selectedGameMode,
      clearAction: () => ({ selectedGameMode: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Theme filter
  if (filterState.selectedTheme !== FILTER_DEFAULTS.ALL) {
    badges.push({
      type: 'theme',
      label: `Theme: ${filterState.selectedTheme}`,
      value: filterState.selectedTheme,
      clearAction: () => ({ selectedTheme: FILTER_DEFAULTS.ALL })
    });
  }
  
  // Rating filter
  if (filterState.minRating !== null || filterState.maxRating !== null) {
    badges.push({
      type: 'rating',
      label: `Rating: ${filterState.minRating}+ stars`,
      value: { min: filterState.minRating, max: filterState.maxRating },
      clearAction: () => ({ minRating: null, maxRating: null })
    });
  }
  
  // Multiplayer filter
  if (filterState.hasMultiplayer) {
    badges.push({
      type: 'multiplayer',
      label: 'Multiplayer Only',
      value: filterState.hasMultiplayer,
      clearAction: () => ({ hasMultiplayer: false })
    });
  }
  
  // Search query
  if (filterState.searchQuery) {
    badges.push({
      type: 'search',
      label: `"${filterState.searchQuery}"`,
      value: filterState.searchQuery,
      clearAction: () => ({ searchQuery: '' })
    });
  }
  
  return badges;
}

export function formatGameCount(count: number): string {
  return count.toLocaleString();
}

export function buildSearchPlaceholder(
  hasActiveFilters: boolean
): string {
  if (hasActiveFilters) {
    return "Search filtered games...";
  }
  return "Search games, genres, developers...";
}

export function getQuickFilterButtonStyle(
  isActive: boolean,
  filterType: 'rating' | 'genre' | 'platform' | 'year' | 'multiplayer'
): string {
  const styles = {
    rating: {
      active: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
      inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-300 border border-gray-700/30"
    },
    genre: {
      active: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-purple-300 border border-gray-700/30"
    },
    platform: {
      active: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-blue-300 border border-gray-700/30"
    },
    year: {
      active: "bg-green-500/20 text-green-300 border border-green-500/30",
      inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-green-300 border border-gray-700/30"
    },
    multiplayer: {
      active: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
      inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-orange-300 border border-gray-700/30"
    }
  };
  
  return isActive ? styles[filterType].active : styles[filterType].inactive;
}