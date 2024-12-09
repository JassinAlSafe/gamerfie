export type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

export interface Platform {
    id: number;
    name: string;
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
    summary?: string;
    total_rating?: number;
    first_release_date?: number;
}

export interface ProcessedGame extends Game {
    genres?: string[];
}

export interface FetchGamesResponse {
    games: ProcessedGame[];
    total: number;
}

