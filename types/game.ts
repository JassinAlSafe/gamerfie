import { ActivityType } from "./friend";

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

interface GameActivity {
  id: string;
  type: ActivityType;
  details: any;
  timestamp: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Game {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  rating: number;
  releaseDate: string;
  first_release_date?: number;
  platforms: Platform[];
  genres: Genre[];
}

export interface UserGame {
  user_id: string;
  game_id: string;
  status: GameStatus;
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
  user_rating?: number;
  completed_at?: string;
  notes?: string;
  last_played_at?: string;
  created_at: string;
  updated_at?: string;
}

export type GameStatus = 'playing' | 'completed' | 'want_to_play' | 'dropped';

export interface Platform {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface GameQueryParams {
  page: number;
  platformId: string;
  searchTerm: string;
  sortBy: SortOption;
}

export type SortOption = 'rating' | 'popularity' | 'name' | 'release';

export interface ProcessedGame extends Game {
  status?: GameStatus;
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
  user_rating?: number;
  completed_at?: string;
  last_played_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FetchGamesResponse {
  games: Game[];
  total: number;
  platforms: Platform[];
  genres: Genre[];
}

export interface GameCategories {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

export interface GameCarouselProps {
  games: Game[];
  category?: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface GameFiltersState {
  platform?: string;
  genre?: string;
  category?: string;
  sort?: 'rating' | 'popularity' | 'name' | 'release';
  search?: string;
}

export interface GameFilters {
  platformId?: string;
  genreId?: string;
  category?: string;
  timeRange?: string;
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
}

