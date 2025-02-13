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
export * from './igdb-types';  // Make sure this exists if you're importing from it

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

