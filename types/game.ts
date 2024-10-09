export interface Cover {
  id: number;
  game: number;
  url: string;
}

export interface Game {
    id: number;
    name: string;
    cover?: {
      id: number;
      url: string;
    };
    first_release_date?: number;
    total_rating?: number;
    summary?: string;
    genres?: Array<{
      id: number;
      name: string;
    }>;
    platforms?: Array<{
      id: number;
      name: string;
    }>;
    websites?: Array<{
      id: number;
      url: string;
      category: number;
    }>;
    involved_companies?: Array<{
      id: number;
      company: {
        id: number;
        name: string;
      };
      developer: boolean;
      publisher: boolean;
    }>;
  }