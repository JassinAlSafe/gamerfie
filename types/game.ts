export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: number;
  points: number;
  rank: number;
  game_id: number;
}

interface Screenshot {
  id: number;
  url: string;
}

export interface Game {
  id: number | string;
  name: string;
  cover?: { url: string } | null;
  cover_url?: string | null;
  rating?: number | null;
  total_rating?: number | null;
  first_release_date?: number | null;
  platforms?: Platform[] | null;
  genres?: Genre[] | null;
  summary?: string | null;
  storyline?: string | null;
  achievements?: Achievement[];
  screenshots?: Screenshot[];
  artworks?: { url: string }[];
  websites?: any[];
  relatedGames?: Game[];
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

export interface GameCategories {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

