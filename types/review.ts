export interface Review {
  game_id: string;
  rating: number;
  review_text: string;
  is_public?: boolean;
  game_details?: {
    name: string;
    cover?: {
      url: string;
    };
  };
}

export interface GameReviewProps {
  gameId: string;
  gameName: string;
  initialRating: number;
  initialReview: string;
  onReviewUpdate: () => void;
} 