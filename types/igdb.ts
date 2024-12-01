export interface IGDBCover {
  id: number;
  url: string;
}

export interface IGDBPlatform {
  id: number;
  name: string;
}

export interface IGDBGenre {
  id: number;
  name: string;
}

export interface IGDBGame {
  id: number;
  name: string;
  cover?: IGDBCover;  // cover is optional but never null
  platforms?: IGDBPlatform[];
  genres?: IGDBGenre[];
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
}

export interface FetchedGame {
  id: number;
  name: string;
  cover: IGDBCover | null;  // cover can be null from API
  platforms?: IGDBPlatform[];
  genres?: IGDBGenre[];
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
}

export interface ProcessedGame {
  id: number;
  name: string;
  cover: {
    id: number;
    url: string;
  } | null;  // maintain null possibility
  platforms: string[];
  genres: string[];
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
}

export interface GameListResponse {
  games: ProcessedGame[];
  total: number;
  page: number;
  pageSize: number;
}

export type GameAPIError = {
  message: string;
  statusCode: number;
};