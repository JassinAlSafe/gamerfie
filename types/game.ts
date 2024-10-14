export interface Cover {
  id: number;
  game: number;
  url: string;
}

export interface Game {
  id: number;
  name: string;
  cover: {
    id: number;
    url: string;
  } | null;
  summary: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
  first_release_date?: number;
  websites?: {
    id: number;
    category: number;
    url: string;
  }[];
  genres?: {
    id: number;
    name: string;
  }[];
  platforms?: {
    id: number;
    name: string;
  }[];
  involved_companies?: {
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  game_modes?: {
    id: number;
    name: string;
  }[];
  player_perspectives?: {
    id: number;
    name: string;
  }[];
  themes?: {
    id: number;
    name: string;
  }[];
  game_engines?: {
    id: number;
    name: string;
  }[];
  screenshots?: {
    id: number;
    url: string;
  }[];
}