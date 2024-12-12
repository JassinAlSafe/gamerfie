export type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

export interface Platform {
    id: number;
    name: string;
    category: number;
}

export interface Cover {
    id: number;
    url: string;
}

export interface Game {
    id: string;
    name: string;
    cover?: Cover;
    platforms?: Platform[];
    genres?: { id: number; name: string }[];
    summary?: string;
    total_rating?: number;
    first_release_date?: number;
    artworks?: { id: number; url: string }[];
    screenshots?: { id: number; url: string }[];
    websites?: { id: number; category: number; url: string }[];
    involved_companies?: {
        id: number;
        company: { id: number; name: string };
        developer: boolean;
        publisher: boolean;
    }[];
}

export interface ProcessedGame {
    id: string;
    name: string;
    cover: Cover | null | undefined;
    platforms: Platform[];
    genres: { id: number; name: string }[];
    summary?: string;
    first_release_date?: number;
    total_rating?: number;
    artworks?: { id: number; url: string }[];
    screenshots?: { id: number; url: string }[];
    websites?: { id: number; category: number; url: string }[];
    involved_companies?: {
        id: number;
        company: { id: number; name: string };
        developer: boolean;
        publisher: boolean;
    }[];
}

export interface FetchGamesResponse {
    games: ProcessedGame[];
    total: number;
    page: number;
    pageSize: number;
}

export type SortOption = 'name' | 'releaseDate' | 'popularity';

export interface GameQueryParams {
  page?: number;
  platformId?: string;
  searchTerm?: string;
  sortBy?: SortOption;
}

