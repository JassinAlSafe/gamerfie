import type { Platform, Genre } from './game';

export interface IGDBCover {
    id: number;
    url: string;
  }
  
  export interface IGDBPlatform {
    id: number;
    name: string;
    category: number;
  }
  
  export interface IGDBGenre {
    id: number;
    name: string;
  }
  
  export interface IGDBCompany {
    id: number;
    name: string;
  }
  
  export interface IGDBCollection {
    id: number;
    name: string;
    games: number[];
  }
  
  /** Base interface for game data from IGDB API */
  export interface IGDBGame {
    id: number;
    name: string;
    cover?: IGDBCover;
    platforms?: Omit<Platform, 'id'>[];
    genres?: Omit<Genre, 'id'>[];
    summary?: string;
    first_release_date?: number;
    rating?: number;
    storyline?: string;
    total_rating?: number;
    total_rating_count?: number;
    involved_companies?: Array<{ company: IGDBCompany }>;
    collection?: IGDBCollection;
    dlcs?: number[];
    expanded_games?: number[];
    expansions?: number[];
    standalone_expansions?: number[];
  }
  
  export interface FetchedGame extends IGDBGame {
    cover?: IGDBCover;
  }
  
  export interface ProcessedGame {
    id: number;
    name: string;
    cover: IGDBCover | null;
    platforms: Platform[];
    genres: Genre[];
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