import { AuthError } from '@supabase/supabase-js';
import { type GameStatus, type Game, type UserGame, type GameReview, type GameMutationHandlers, type UserGamesResponse, type QueryData, type GameCardProps } from './game';
import { type TwitchTokenResponse, type TokenResult, TwitchError } from './twitch';
import { type IGDBCover, type IGDBPlatform, type IGDBGenre, type IGDBGame, type FetchedGame, type ProcessedGame, type GameListResponse, type GameAPIError } from './igdb';
import { type TimelineEntry } from './timeline';

export type { GameStatus, Game, UserGame, GameReview, GameMutationHandlers, UserGamesResponse, QueryData, GameCardProps };
export type { TwitchTokenResponse, TokenResult };
export type { IGDBCover, IGDBPlatform, IGDBGenre, IGDBGame, FetchedGame, ProcessedGame, GameListResponse };
export type { TimelineEntry };

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at?: string;
}

export interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}

export interface GamesPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (newPage: number) => void;
}

export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export { TwitchError, GameAPIError };