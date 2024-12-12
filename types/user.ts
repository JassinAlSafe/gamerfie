export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
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