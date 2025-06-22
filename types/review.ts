// Updated Review Types for the new dedicated reviews architecture

export interface Review {
  id: string;
  user_id: string;
  game_id: string;
  rating: number; // 1-10
  review_text?: string;
  is_public: boolean;
  playtime_at_review?: number; // hours played when review was written
  is_recommended?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (populated via joins)
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    display_name?: string;
  };
  game_details?: {
    name: string;
    cover_url?: string;
    developer?: string;
    publisher?: string;
    genres?: string[];
    release_date?: string;
    isValidated?: boolean;
    validationReason?: string;
    lastValidated?: number;
  };
  
  // Stats (populated via aggregations)
  likes_count?: number;
  bookmarks_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  user_has_bookmarked?: boolean;
  
  // Compatibility aliases for existing code
  is_liked?: boolean;
  is_bookmarked?: boolean;
  helpfulness_score?: number;
}

export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewBookmark {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
    display_name?: string;
  };
}

// API Response Types
export interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingsDistribution: Record<number, number>; // rating -> count
  topGenres: Array<{ genre: string; count: number }>;
}

// Form Types
export interface CreateReviewData {
  game_id: string;
  rating: number;
  review_text?: string;
  is_public?: boolean;
  playtime_at_review?: number;
  is_recommended?: boolean;
}

export interface UpdateReviewData extends Partial<CreateReviewData> {
  id: string;
}

// Legacy support for existing code (deprecated)
export type GameReview = Review;

export interface GameReviewProps {
  gameId: string;
  gameName: string;
  initialRating?: number;
  initialReview?: string;
  initialIsPublic?: boolean;
  onReviewUpdate?: () => void;
} 