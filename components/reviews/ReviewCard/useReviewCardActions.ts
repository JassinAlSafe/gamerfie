import { useState } from "react";

export function useReviewCardActions(
  reviewId: string,
  onLike?: (reviewId: string) => void,
  onShare?: (reviewId: string) => void,
  onBookmark?: (reviewId: string) => void
) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(reviewId);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(reviewId);
  };

  const handleShare = () => {
    onShare?.(reviewId);
  };

  const toggleFullReview = () => {
    setShowFullReview(!showFullReview);
  };

  return {
    isLiked,
    isBookmarked,
    showFullReview,
    handleLike,
    handleBookmark,
    handleShare,
    toggleFullReview,
  };
} 