// Core domain types - the inevitable foundation

// Base Response Pattern
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  hasMore: boolean;
}

// Standard Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiError {
  field: string;
  value: unknown;
}

// Core User Types
export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Core Game Types
export interface Game {
  id: string;
  name: string;
  cover_url?: string;
  rating?: number;
  summary?: string;
  platforms?: Platform[];
  genres?: Genre[];
  release_date?: string;
}

export interface Platform {
  id: string;
  name: string;
  slug?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug?: string;
}

// Response Type Aliases
export type GameResponse = PaginatedResponse<Game>;
export type UserResponse = PaginatedResponse<User>;

// Filter and Query Types
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GameFilters extends BaseFilters {
  platform?: string;
  genre?: string;
  category?: string;
  year?: string;
  rating_min?: number;
  rating_max?: number;
}

// Activity Types
export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  created_at: string;
  content?: string;
  game_id?: string;
}

// Collection Types
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  game_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}