import { LucideIcon } from "lucide-react";
import { ActivityType } from "./activity";

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: number;
  points: number;
  rank: number;
  game_id: number;
}

export interface Screenshot {
  id: number;
  url: string;
}

export interface GameActivityDetails {
  achievement?: Achievement;
  status?: GameStatus;
  rating?: number;
  review?: string;
  playtime?: number;
}

export interface GameActivity {
  id: string;
  type: ActivityType;
  details: GameActivityDetails;
  metadata: {
    status?: string;
    achievement?: {
      name: string;
      icon_url?: string;
    };
    rating?: number;
    review?: string;
    playtime?: number;
  };
  timestamp: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reactions?: {
    count: number;
    user_has_reacted: boolean;
  };
  comments?: {
    count: number;
  };
}

export interface Game {
  id: string;
  title: string;
  coverImage: string;
  lastPlayed?: string;
  playtime: number; // in minutes
  platform: GamePlatform;
  achievements?: {
    total: number;
    completed: number;
  };
  rating?: number;
  releaseDate?: string;  // Make optional
  first_release_date?: number;
  platforms: Platform[];
  genres: Genre[];
  summary?: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  rating_count?: number;
  follows_count?: number;
  hype_count?: number;
  status?: GameStatus;
  metacritic?: number;
}

export type GamePlatform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile';

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  play_time: number;
  completion_percentage?: number;
  created_at: string;
  updated_at: string;
  last_played_at?: string;
  achievements_completed?: number;
  notes?: string;
  game?: Game;
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

export type CategoryOption = "popular" | "trending" | "upcoming";

export interface ProcessedGame extends Game {
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
  user_rating?: number;
  total_rating_count?: number;
  completed_at?: string;
  last_played_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  cover_url?: string;
  name?: string;
  games?: {
    id: string;
    name: string;
    cover_url: string | null;
    background_image?: string;  // Add RAWG's background_image field
    // Add other potential nested properties
  };
}

export interface FetchGamesResponse {
  games: Game[];
  total: number;
  platforms?: Platform[];  // Made optional
  genres?: Genre[];       // Made optional
  page: number;
  pageSize: number;
}

export interface GameCategories {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

export type GameCategory = "popular" | "upcoming" | "trending";

export interface GameCarouselProps {
  games: ProcessedGame[];
  category: GameCategory;
  title: string;
  icon: LucideIcon;
  color: string;
}

export interface GameFiltersState {
  platform?: string;
  genre?: string;
  category?: string;
  sort?: SortOption;
  search?: string;
}

export interface GameFilters {
  page?: number;
  limit?: number;
  platformId?: number;
  genreId?: number;
  timeRange?: 'recent' | 'upcoming' | 'classic';
  isIndie?: boolean;
  isAnticipated?: boolean;
  search?: string;
  sortBy?: SortOption;
  releaseYear?: {
    start: number;
    end: number;
  };
}

export interface GamePageProps {
  params: {
    id: string;
  }
}

export interface ReviewUpdateData {
  gameId: string;
  rating?: number;
  review?: string;
  status?: GameStatus;
}

export interface GameStats {
  totalGames: number;
  totalPlaytime: number; // in minutes
  recentlyPlayed: Game[];
  mostPlayed: Game[];
}

export interface SearchGameResult extends Game {
  cover?: {
    id: string;
    url: string;
  };
}

export interface GameWithProgress extends Game {
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
}

export interface JournalGameData {
  id: string;
  name: string;
  cover_url?: string;
}

export interface GameCardProps {
  game: ProcessedGame;
  index?: number;
  category?: GameCategory;
}

export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}