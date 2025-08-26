import { Game as BaseGame } from './game';

// Extended Game type specifically for the game service
export interface GameExtended extends BaseGame {
  cover?: {
    id: string;
    url: string;
  };
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  artworks?: Array<{
    id: string;
    url: string;
  }>;
  screenshots?: Array<{
    id: string;
    url: string;
  }>;
  websites?: Array<{
    id: string | number;
    url: string;
    category?: number;
  }>;
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

export interface GameQueryParams {
  page: number;
  platformId: string;
  searchTerm: string;
  sortBy: SortOption | string;
}

export interface FetchGamesResponse {
  games: GameExtended[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Platform {
  id: string | number;
  name: string;
  category?: number;
}

export type SortOption = 'popularity' | 'rating' | 'name' | 'release'; 