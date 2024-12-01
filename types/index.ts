import { AuthError } from '@supabase/supabase-js'
import { type GameStatus } from "@/components/game-card";

export function isSupabaseError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at?: string;
}

export interface Game {
  id: string;
  user_id: string;
  name: string;
  cover?: { url: string }; // Update cover type to match GameCard prop
  platforms?: { id: number; name: string }[]; // Update platforms type to match GameCard prop
  status: GameStatus;  // Update to use shared GameStatus type
  updated_at: string;
  review?: {
    rating: number;
    text: string;
  };
}

export interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}