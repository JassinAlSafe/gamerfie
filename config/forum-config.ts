/**
 * Forum Configuration
 * Centralized configuration following Inevitable TypeScript Architecture
 */

// Display and Pagination Constants
export const DISPLAY_LIMITS = {
  THREADS_PER_PAGE: 20,
  POSTS_PER_PAGE: 25,
  CATEGORIES_PER_PAGE: 50,
  SEARCH_RESULTS_PER_PAGE: 15,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MIN_SEARCH_QUERY_LENGTH: 2,
} as const;

// Cache Durations (in seconds)
export const CACHE_DURATIONS = {
  FORUM_DATA: 300,        // 5 minutes
  CATEGORIES: 300,        // 5 minutes  
  THREADS: 120,           // 2 minutes
  POSTS: 60,              // 1 minute
  SEARCH_RESULTS: 30,     // 30 seconds
  STATS: 600,             // 10 minutes
} as const;

// Validation Constants
export const VALIDATION_LIMITS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 10000,
  MIN_CATEGORY_NAME_LENGTH: 2,
  MAX_CATEGORY_NAME_LENGTH: 50,
  MAX_CATEGORY_DESCRIPTION_LENGTH: 500,
} as const;

// Visual Design Constants
export const DESIGN_CONSTANTS = {
  COLORS: {
    PRIMARY: 'purple',
    SUCCESS: 'green',
    WARNING: 'amber', 
    DANGER: 'red',
    INFO: 'blue',
  },
  GRADIENTS: {
    BACKGROUND: 'bg-gradient-to-b from-gray-950 to-gray-900',
    CARD_HOVER: 'hover:bg-gray-900/50',
    CARD_DEFAULT: 'bg-gray-900/30',
  },
  BORDERS: {
    DEFAULT: 'border-gray-700/30',
    HOVER: 'hover:border-gray-600/50',
    FOCUS: 'focus:border-purple-500',
  },
  TEXT: {
    PRIMARY: 'text-white',
    SECONDARY: 'text-gray-400',
    ACCENT: 'text-purple-400',
    SUCCESS: 'text-green-400',
  },
} as const;

// Animation Configuration
export const ANIMATIONS = {
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-200',
    SLOW: 'transition-all duration-300',
    FAST: 'transition-all duration-100',
  },
  HOVER: {
    LIFT: 'hover:-translate-y-0.5',
    SCALE: 'hover:scale-105',
    FADE: 'hover:opacity-80',
  },
} as const;

// Forum Categories Configuration
export const CATEGORY_CONFIG = {
  DEFAULT_ICON: '💬',
  ICON_SIZE: 'w-12 h-12',
  CARD_SPACING: 'space-y-4',
  STATS_DISPLAY: {
    SHOW_ACTIVITY_INDICATOR: true,
    SHOW_LAST_POST: true,
    SHOW_MEMBER_COUNT: true,
  },
} as const;

// Thread Configuration  
export const THREAD_CONFIG = {
  PINNED_PRIORITY: 1000,
  LOCKED_INDICATOR: '🔒',
  PINNED_INDICATOR: '📌',
  HOT_THRESHOLD: 10, // replies to consider "hot"
  RECENT_THRESHOLD_HOURS: 24,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  PLACEHOLDER: 'Search categories and discussions...',
  DEBOUNCE_MS: 300,
  MIN_RESULTS_FOR_PAGINATION: 10,
  HIGHLIGHT_CLASS: 'bg-purple-500/20 text-purple-200',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested content was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait a moment.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  THREAD_CREATED: 'Thread created successfully!',
  POST_CREATED: 'Post published successfully!',
  CATEGORY_CREATED: 'Category created successfully!',
  THREAD_UPDATED: 'Thread updated successfully!',
  POST_UPDATED: 'Post updated successfully!',
  THREAD_DELETED: 'Thread deleted successfully.',
  POST_DELETED: 'Post deleted successfully.',
} as const;

// Loading States
export const LOADING_STATES = {
  CREATING_THREAD: 'Creating thread...',
  POSTING_REPLY: 'Posting reply...',
  LOADING_THREADS: 'Loading threads...',
  LOADING_POSTS: 'Loading posts...',
  SEARCHING: 'Searching...',
  DELETING: 'Deleting...',
} as const;

// Permissions Configuration
export const PERMISSIONS = {
  ROLES: {
    USER: 'user',
    MODERATOR: 'moderator', 
    ADMIN: 'admin',
  },
  ACTIONS: {
    CREATE_THREAD: 'create_thread',
    CREATE_POST: 'create_post',
    EDIT_OWN_CONTENT: 'edit_own_content',
    DELETE_OWN_CONTENT: 'delete_own_content',
    MODERATE_CONTENT: 'moderate_content',
    MANAGE_CATEGORIES: 'manage_categories',
  },
} as const;