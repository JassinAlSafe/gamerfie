import { UserSettings } from "./settings";

export interface Profile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  settings?: UserSettings;
}

export interface QueryData {
  pages: UserGamesResponse[];
  pageParams: number[];
}

export interface UserGamesResponse {
  userGames: UserGame[];
  reviews: GameReview[];
  hasMore?: boolean;
}

export interface ReviewUpdateData {
  gameId: string;
  review: string;
  rating: number;
}

export interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
} 