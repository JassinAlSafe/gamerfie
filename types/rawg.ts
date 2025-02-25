export interface RAWGPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
  released_at?: string;
  requirements?: {
    minimum?: string;
    recommended?: string;
  };
}

export interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: Array<{
    id: number;
    title: string;
    count: number;
    percent: number;
  }>;
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: {
    yet?: number;
    owned?: number;
    beaten?: number;
    toplay?: number;
    dropped?: number;
    playing?: number;
  };
  metacritic: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  platforms: RAWGPlatform[];
  genres: Array<{
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
  }>;
  stores: Array<{
    id: number;
    store: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    language: string;
    games_count: number;
    image_background: string;
  }>;
  esrb_rating: {
    id: number;
    name: string;
    slug: string;
  } | null;
  short_screenshots: Array<{
    id: number;
    image: string;
  }>;
  description_raw?: string;
  description?: string;
  developers?: Array<{
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
  }>;
  publishers?: Array<{
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
  }>;
  parent_platforms?: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  metacritic_platforms?: Array<{
    metascore: number;
    url: string;
    platform: {
      platform: number;
      name: string;
      slug: string;
    };
  }>;
}

export interface RAWGResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  user_platforms?: boolean;
}

export interface RAWGScreenshot {
  id: number;
  image: string;
}

export interface RAWGStore {
  id: number;
  url: string;
  store: {
    id: number;
    name: string;
    slug: string;
    domain: string;
  };
}

export interface RAWGGameDetails extends RAWGGame {
  achievements_count: number;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  website: string;
  metacritic_url: string;
}

export interface RAWGGameQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  search_precise?: boolean;
  search_exact?: boolean;
  parent_platforms?: string;
  platforms?: string;
  stores?: string;
  developers?: string;
  publishers?: string;
  genres?: string;
  tags?: string;
  creators?: string;
  dates?: string;
  updated?: string;
  metacritic?: string;
  platforms_count?: number;
  exclude_additions?: boolean;
  exclude_parents?: boolean;
  exclude_game_series?: boolean;
  exclude_stores?: string;
  ordering?: string;
} 