import { LucideIcon } from "lucide-react";
import { ActivityType } from "./activity";

// Base Types
export type GameStatus = 'playing' | 'completed' | 'want_to_play' | 'dropped';
export type GamePlatform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile';

// Filter and Sort Types
export type SortOption = 'popularity' | 'rating' | 'name' | 'release' | 'recent';
export type CategoryOption = 'all' | 'popular' | 'trending' | 'upcoming' | 'recent' | 'classic';
export type FilterType = 'platform' | 'genre' | 'category' | 'year' | 'search' | 'sort';
export type TimeRange = 'recent' | 'upcoming' | 'classic' | 'all';

// Core Interfaces
export interface Platform {
  id: string | number;
  name: string;
  slug?: string;
}

export interface Genre {
  id: string | number;
  name: string;
  slug?: string;
}

// Video interface for game trailers
export interface GameVideo {
  id: string | number;
  name?: string;
  url: string;
  thumbnail_url?: string;
  video_id?: string;
  provider?: 'youtube' | 'vimeo' | 'other';
}

// Base Game Interface (common properties across all sources)
export interface BaseGame {
  id: string;
  name: string;
  title?: string; // Some sources use title instead of name
  cover_url?: string | null;
  coverImage?: string; // Legacy support
  rating?: number;
  summary?: string;
  platforms?: Platform[];
  genres?: Genre[];
  created_at?: string;
  updated_at?: string;
}

// Game Progress Interface
export interface GameProgress {
  playTime: number;
  completionPercentage?: number;
  achievementsCompleted?: number;
  lastPlayedAt?: string;
  userRating?: number;
  notes?: string;
}

// User Game Relationship
export interface UserGame extends GameProgress {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  created_at: string;
  updated_at: string;
  game?: BaseGame;
}

// Extended Game Interface (includes all possible properties)
export interface Game extends BaseGame {
  background_image?: string;
  cover?: {
    id: string;
    url: string;

  };
  screenshots?: Array<{
    id: string;
    url: string;
  }>;
  artworks?: Array<{
    id: string;
    url: string;
  }>;
  videos?: GameVideo[];
  first_release_date?: number;
  releaseDate?: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  rating_count?: number;
  follows_count?: number;
  hype_count?: number;
  status?: GameStatus;
  metacritic?: number;
  achievements?: {
    total: number;
    completed: number;
  };
  relatedGames?: Game[];
  involved_companies?: Array<{
    id: string | number;
    company?: {
      id: string | number;
      name: string;
    };
    developer?: boolean;
    publisher?: boolean;
  }>;
}

// Game with User Data (combined interface for library view)
export interface GameWithUserData {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  playTime: number;
  created_at: string;
  updated_at: string;
  completionPercentage: number;
  achievementsCompleted: number;
  userRating?: number;
  notes?: string;
  lastPlayedAt?: string;
  coverUrl?: string;
  games?: any; // This should be properly typed based on your data structure
}

// Search and Display Interfaces
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

export interface ProcessedGame extends Game {
  games?: {
    cover_url?: string | null;
    background_image?: string;
  };
  title?: string;
  coverImage?: string;
}

export interface JournalGameData {
  id: string;
  name: string;
  cover_url?: string;
}

export interface GameCarouselProps {
  games: Game[];
  category: CategoryOption;
  title: string;
  icon: LucideIcon;
  color: string;
}

// Filter and Query Interfaces
export interface GameFilters {
  status?: GameStatus | 'all';
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  platform?: string;
  genre?: string;
  category?: CategoryOption;
  search?: string;
  page?: number;
  limit?: number;
  timeRange?: TimeRange;
  releaseYear?: {
    start: number;
    end: number;
  };
}

export interface GameQueryParams {
  page: number;
  platformId: string;
  searchTerm: string;
  sortBy: SortOption;
}

// Response Interfaces
export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  platforms?: Platform[];
  genres?: Genre[];
}

export interface FetchGamesResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}

// Component Props Interfaces
export interface GameCardProps {
  game: Game;
  index?: number;
  category?: CategoryOption;
}

export interface GamesTabProps {
  filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

// Page Props
export interface GamePageProps {
  params: {
    id: string;
  };
}

// Activity Related Interfaces
export interface GameActivityDetails {
  achievement?: Achievement;
  status?: GameStatus;
  rating?: number;
  review?: string;
  playtime?: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: number;
  points: number;
  rank: number;
  game_id: number;
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

// GameStats interface moved to types/user.ts to avoid duplication

// Store State Types
export interface GameFilterState {
  sortBy: SortOption;
  selectedPlatform: string;
  selectedGenre: string;
  selectedCategory: CategoryOption;
  selectedYear: string;
  timeRange: TimeRange;
  searchQuery: string;
}

export interface GamePaginationState {
  currentPage: number;
  totalPages: number;
  totalGames: number;
}

export interface GameFilterUpdate extends Partial<GameFilterState> {
  currentPage?: number;
}