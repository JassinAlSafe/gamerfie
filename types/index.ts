import { UseMutationResult } from '@tanstack/react-query';
import { AuthError } from '@supabase/supabase-js';

// Game related types
export type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

export interface Platform {
  id: number;
  name: string;
  abbreviation?: string;
  alternative_name?: string;
  category?: number;
  generation?: number;
  platform_family?: number;
  slug: string;
  summary?: string;
  url?: string;
}

export interface Cover {
  id: number;
  game?: number;
  url: string;
}

export interface Game {
  id: string;
  name: string;
  cover?: { url: string } | undefined;
  platforms?: Array<{ id: number; name: string }>;
  status: GameStatus;
  user_id: string;
  updated_at: string;
  review?: { rating: number; text: string };
  summary?: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  first_release_date?: number;
  websites?: {
    id: number;
    category: number;
    url: string;
  }[];
  genres?: {
    id: number;
    name: string;
  }[];
  involved_companies?: {
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  game_modes?: {
    id: number;
    name: string;
  }[];
  player_perspectives?: {
    id: number;
    name: string;
  }[];
  themes?: {
    id: number;
    name: string;
  }[];
  game_engines?: {
    id: number;
    name: string;
  }[];
  artworks?: {
    id: number;
    url: string;
  }[];
  screenshots?: {
    id: number;
    url: string;
  }[];
  videos?: {
    id: number;
    name: string;
    video_id: string;
  }[];
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  created_at: string;
}

export interface GameReview {
  game_id: string;
  rating: number;
  review_text: string;
}

export interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}

// User related types
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  updated_at: string;
}

// API related types
export interface GameApiPlatform {
  id: number;
  name: string;
}

export interface GameApiResponse {
  id: string;
  name: string;
  cover?: Cover;
  platforms?: Array<Platform | string>;
  summary?: string;
  storyline?: string;
  total_rating?: number;
}

export interface UserGamesResponse {
  userGames: UserGame[];
  reviews: GameReview[];
  hasMore?: boolean;
}

export interface QueryData {
  pages: UserGamesResponse[];
  pageParams: number[];
}

export interface ReviewUpdateData {
  gameId: string;
  review: string;
  rating: number;
}

// Component props types
export interface GameCardProps {
  id: string | number;
  name: string;
  description?: string;
  cover?: { url: string } | null;
  platforms?: Array<{ id: number; name: string }>;
  status: GameStatus;
  rating?: number;
  isPriority?: boolean;
  onStatusChange: (status: GameStatus) => void;
  onRemove: () => void;
  onReviewUpdate: (rating: number, reviewText: string) => void;
}

export interface GamesPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (newPage: number) => void;
}

// Mutation related types
export interface GameMutationHandlers {
  updateGameStatus: UseMutationResult<
    { gameId: string; status: string },
    unknown,
    { gameId: string; status: string },
    unknown
  >;
  removeFromLibrary: UseMutationResult<
    string,
    Error,
    string,
    unknown
  >;
  onReviewUpdate: UseMutationResult<
    ReviewUpdateData,
    Error,
    ReviewUpdateData,
    unknown
  >;
  updateReview: UseMutationResult<
    { gameId: string; status: string },
    Error,
    ReviewUpdateData,
    unknown
  >;
}

// Utility types
export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Re-exports
export type {
  TwitchTokenResponse,
  TokenResult,
  TwitchError
} from './twitch';

export type {
  IGDBCover,
  IGDBPlatform,
  IGDBGenre,
  IGDBGame,
  FetchedGame,
  ProcessedGame,
  GameListResponse,
  GameAPIError
} from './igdb';

export type { TimelineEntry } from './timeline';

