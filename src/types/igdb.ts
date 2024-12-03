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

/** Base interface for game data from IGDB API */
export interface IGDBGame {
  id: number;
  name: string;
  cover?: IGDBCover;
  platforms?: IGDBPlatform[];
  genres?: IGDBGenre[];
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  total_rating_count?: number;
}

export interface FetchedGame extends IGDBGame {
  cover?: {
    id: number;
    url: string;
  };
}

export interface ProcessedGame {
  id: number;
  name: string;
  cover: {
    id: number;
    url: string;
  } | null;
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