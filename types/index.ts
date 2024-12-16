export * from './game';
export * from './timeline';
export * from './about';

// Keep this utility here or move to utils/
export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Game related types
export interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
  total_rating_count?: number;
  genres?: Genre[];
  platforms?: Platform[];
  first_release_date?: number;
  summary?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Platform {
  id: number;
  name: string;
  category?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface IGDBResponse {
  games: Game[];
  totalGames: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

// Filter and Sort types
export interface GameFilters {
  platform?: string;
  genre?: string;
  category?: string;
  searchQuery?: string;
}

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

// Category types
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

