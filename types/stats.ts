export interface UserStats {
  total_games: number;
  completed_games: number;
  avg_rating?: number;
  total_playtime?: number;
  journal?: {
    total_entries: number;
    total_reviews: number;
  };
}

export interface ProfileStats {
  totalGames: number;
  totalPlaytime: number;
  recentlyPlayed: Array<{
    id: string;
    name: string;
    cover_url?: string;
    last_played_at: string;
  }>;
  mostPlayed: Array<{
    id: string;
    name: string;
    cover_url?: string;
    playtime_hours: number;
  }>;
}

export interface GameStats {
  total_played: number;
  played_this_year: number;
  backlog: number;
}