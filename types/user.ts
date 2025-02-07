import { UserGame } from "./game";

export interface GameReview {
  id: string;
  user_id: string;
  game_id: string;
  review: string;
  rating: number;
  created_at: string;
  updated_at: string;
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