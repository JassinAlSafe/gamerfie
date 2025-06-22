import { GameReview } from "@/hooks/Reviews/types";

export interface ReviewCardProps {
  review: GameReview;
  showGameInfo?: boolean;
  onLike?: (reviewId: string) => void;
  onShare?: (reviewId: string) => void;
  onBookmark?: (reviewId: string) => void;
  className?: string;
} 