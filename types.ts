
export interface UserGame {
  game_id: string;
  user_id: string;
  status: GameStatus;
  updated_at: string;
}

export interface GameReview {
  game_id: string;
  rating: number;
  review_text: string;
}

export interface GameApiPlatform {
  id: number;
  name: string;
}

export interface GameApiCover {
  id: number;
  url: string;
}

export interface GameApiResponse {
  id: string;
  name: string;
  cover?: GameApiCover;
  platforms?: Array<GameApiPlatform | string>;
}

export interface Game {
  id: string;
  name: string;
  cover?: { url: string };
  platforms?: Array<{ id: number; name: string }>;
  status?: GameStatus;
  review?: { rating: number; text: string };
}

export type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";