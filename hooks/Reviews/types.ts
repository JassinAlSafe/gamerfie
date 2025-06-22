export interface GameReview {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  game_details?: {
    name: string;
    cover_url?: string;
    developer?: string;
    publisher?: string;
    genres?: string[];
    release_date?: string;
  };
}

export interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingsDistribution: Record<number, number>;
  topGenres: Array<{ genre: string; count: number }>;
}