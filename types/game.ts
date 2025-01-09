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
  id: number | string;
  name: string;
  cover?: { url: string } | null;
  cover_url?: string | null;
  rating?: number | null;
  total_rating?: number | null;
  total_rating_count?: number;
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
  activities?: GameActivity[];
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
  page: number;
  pageSize: number;
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

