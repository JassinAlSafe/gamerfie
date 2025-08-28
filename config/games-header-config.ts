/**
 * Configuration constants for GamesHeader component
 * Centralizes all magic values, filter options, and styling constants
 */

import {
  ArrowLeft,
  Filter,
  X,
  Gamepad2,
  LayoutGrid,
  List,
  Star,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Filter default values
export const FILTER_DEFAULTS = {
  ALL: "all",
  SORT_BY: "popularity",
  SEARCH_QUERY: "",
  RATING_MULTIPLIER: 10,
  MIN_RATING: null,
  MAX_RATING: null,
  HAS_MULTIPLAYER: false
} as const;

// Sort options configuration
export const SORT_OPTIONS = [
  { value: "popularity", label: "Popular", icon: Filter },
  { value: "rating", label: "Top Rated", icon: Star },
  { value: "release", label: "Release Date", icon: Calendar },
  { value: "name", label: "Name (A-Z)", icon: Gamepad2 },
] as const;

// Quick filter ratings (UI scale 1-10)
export const QUICK_FILTER_RATINGS = [9, 8, 7, 6] as const;

// Time range options with display labels
export const TIME_RANGE_OPTIONS = {
  upcoming: "Upcoming",
  recent: "Recent", 
  "this-year": "This Year",
  "last-year": "Last Year",
  classic: "Classic"
} as const;

// Quick filter year options
export const QUICK_FILTER_YEARS = ["2024", "2023", "2020s"] as const;

// View mode configuration
export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list"
} as const;

// Component display limits
export const DISPLAY_LIMITS = {
  GENRES_QUICK: 5,
  PLATFORMS_QUICK: 3,
  GENRES_OVERFLOW_THRESHOLD: 5
} as const;

// Styling configuration
export const STYLES = {
  CONTAINER: {
    className: "relative px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4"
  },
  INNER_CONTAINER: {
    className: "container mx-auto max-w-[2000px]"
  },
  TOP_BAR: {
    className: "relative rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-900/90 via-gray-900/95 to-gray-900/90 shadow-lg border border-gray-800/50 p-3 sm:p-4 mb-4"
  },
  GRID_PATTERN: {
    className: "absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] rounded-xl"
  },
  FILTERS_BAR: {
    className: "bg-gray-900/30 rounded-lg border border-gray-800/30 p-3 sm:p-4"
  },
  VIEW_MODE_TOGGLE: {
    container: "flex bg-gray-800/70 border border-gray-700/50 rounded-full p-0.5",
    button: "h-8 w-8 p-0 rounded-full",
    active: "bg-purple-500/30 text-white",
    inactive: "text-gray-400 hover:text-white hover:bg-gray-700/50"
  },
  SORT_DROPDOWN: {
    trigger: "min-w-[120px] sm:min-w-[140px] justify-between bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70 rounded-full text-xs sm:text-sm",
    content: "w-48 bg-gray-800 border-gray-700 rounded-lg shadow-lg",
    item: {
      base: "cursor-pointer focus:bg-purple-500/30 focus:text-white transition-colors",
      active: "bg-purple-500/30 text-white"
    }
  }
} as const;

// Quick filter button styling
export const QUICK_FILTER_STYLES = {
  RATING: {
    active: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-yellow-300 border border-gray-700/30"
  },
  GENRE: {
    active: "bg-purple-500/20 text-purple-300 border border-purple-500/30", 
    inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-purple-300 border border-gray-700/30"
  },
  PLATFORM: {
    active: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-blue-300 border border-gray-700/30"
  },
  YEAR: {
    active: "bg-green-500/20 text-green-300 border border-green-500/30",
    inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-green-300 border border-gray-700/30"
  },
  MULTIPLAYER: {
    active: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    inactive: "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-orange-300 border border-gray-700/30"
  }
} as const;

// Active filter badge styling
export const ACTIVE_FILTER_BADGE = {
  className: "bg-gray-800/70 hover:bg-gray-700 text-white border-purple-500/30 pl-2 pr-1 py-1 flex items-center gap-1 rounded-full text-xs",
  removeButton: "h-4 w-4 p-0 rounded-full hover:bg-gray-700 ml-1"
} as const;

// Animation configuration
export const ANIMATIONS = {
  QUICK_FILTERS: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 }
  }
} as const;

// Icon configuration for quick filters
export const QUICK_FILTER_ICONS = {
  RATING: Star,
  GENRE: "circle", // Custom circle div
  PLATFORM: Gamepad2,
  YEAR: Calendar,
  MULTIPLAYER: Gamepad2
} as const;

// Quick filter sections configuration
export const QUICK_FILTER_SECTIONS = {
  RATING: {
    icon: Star,
    label: "Rating:",
    values: QUICK_FILTER_RATINGS,
    style: QUICK_FILTER_STYLES.RATING
  },
  GENRE: {
    icon: "circle",
    label: "Genres:",
    limit: DISPLAY_LIMITS.GENRES_QUICK,
    style: QUICK_FILTER_STYLES.GENRE
  },
  PLATFORM: {
    icon: Gamepad2, 
    label: "Platforms:",
    limit: DISPLAY_LIMITS.PLATFORMS_QUICK,
    style: QUICK_FILTER_STYLES.PLATFORM
  },
  YEAR: {
    icon: Calendar,
    label: "Release & Features:",
    values: QUICK_FILTER_YEARS,
    style: QUICK_FILTER_STYLES.YEAR,
    includeMultiplayer: true
  }
} as const;

// Platform name shortening rules
export const PLATFORM_NAME_MAPPING = {
  'PlayStation': 'PS',
  'Nintendo': 'Nintendo',
  'Xbox': 'Xbox'
} as const;

// Header navigation configuration
export const HEADER_NAV = {
  BACK_BUTTON: {
    href: "/explore",
    label: "Back to Explore",
    icon: ArrowLeft,
    className: "rounded-full hover:bg-gray-800/70 text-gray-400 hover:text-white"
  },
  TITLE: {
    icon: Gamepad2,
    text: "Browse Games",
    className: "text-xl sm:text-2xl font-bold text-white"
  }
} as const;

// Search configuration
export const SEARCH_CONFIG = {
  placeholder: "Search games, genres, developers...",
  className: "w-full"
} as const;

// Filter state tracking
export const FILTER_STATE_KEYS = [
  'selectedPlatform',
  'selectedGenre', 
  'selectedCategory',
  'selectedYear',
  'timeRange',
  'selectedGameMode',
  'selectedTheme',
  'minRating',
  'maxRating',
  'hasMultiplayer',
  'sortBy',
  'searchQuery'
] as const;

// Type exports for configuration
export type SortValue = typeof SORT_OPTIONS[number]['value'];
export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];
export type QuickFilterRating = typeof QUICK_FILTER_RATINGS[number];
export type QuickFilterYear = typeof QUICK_FILTER_YEARS[number];
export type TimeRangeKey = keyof typeof TIME_RANGE_OPTIONS;
export type FilterStateKey = typeof FILTER_STATE_KEYS[number];