export interface Game {
  id: string;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  platforms?: Platform[];
  genres?: Genre[];
  rating?: number;
  first_release_date?: number;
  summary?: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  artworks?: { url: string }[];
  screenshots?: { url: string }[];
  websites?: any[];
  involved_companies?: any[];
}

export interface UserGame {
  user_id: string;
  game_id: string;
  status: GameStatus;
  play_time?: number;
  user_rating?: number;
  completed_at?: string;
  notes?: string;
  last_played_at?: string;
  created_at: string;
}

export type GameStatus = 'playing' | 'completed' | 'want_to_play' | 'dropped';

export interface Platform {
  id: number;
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GameQueryParams {
  page: number;
  platformId: string;
  searchTerm: string;
  sortBy: SortOption;
}

export type SortOption = 'popularity' | 'releaseDate' | 'name';

export interface ProcessedGame extends Game {
  status?: GameStatus;
  playTime?: number;
  userRating?: number;
  completedAt?: string;
  lastPlayedAt?: string;
  notes?: string;
}

export interface FetchGamesResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}

