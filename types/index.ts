import type { AuthError } from '@supabase/supabase-js';

// Export all type modules
export * from './game';
export * from './timeline';
export * from './about';
export * from './profile';
export * from './settings';
export * from './supabase';
export * from './badge';
export * from './activity';
export * from './friend';
export * from './comments';
export * from './challenge';
export * from './errors';

// Export IGDB types with specific names to avoid conflicts
export type {
  IGDBGame,
  IGDBCover,
  IGDBPlatform,
  IGDBGenre,
  IGDBCompany,
  IGDBProcessedGame,
  IGDBResponse,
  GameAPIError
} from './igdb-types';

// Export GameListResponse from IGDB types with a specific name
export type { GameListResponse as IGDBGameListResponse } from './igdb-types';

// Export new type-safe patterns
export type {
  RelatedGameData,
  GameApiResponse,
  SafeGameAccess
} from './game';

// Utility function for Supabase error checking
export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Generic API Response types
export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

// Sort options
export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
  { value: "name", label: "Name" },
  { value: "release", label: "Release Date" }
];

// Game categories
export const GAME_CATEGORIES = {
  all: "All Games",
  recent: "Recent Games",
  popular: "Popular Games",
  upcoming: "Upcoming Games",
  classic: "Classic Games",
  indie: "Indie Games",
  anticipated: "Most Anticipated"
} as const;

export type GameCategory = keyof typeof GAME_CATEGORIES;

export type ActivityType = 
  | 'achievement' 
  | 'playtime' 
  | 'review' 
  | 'friend' 
  | 'level_up' 
  | 'game_started';

export interface Activity {
  id: string;
  type: ActivityType;
  game: string;
  action: string;
  detail: string;
  timestamp: string;
  imageUrl?: string;
  rating?: number;
}

