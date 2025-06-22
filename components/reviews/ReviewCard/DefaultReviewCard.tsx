import React from "react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ReviewCardProps } from "./types";
import { useReviewCardActions } from "./useReviewCardActions";
import { ReviewCardHeader } from "./ReviewCardHeader";
import { GameInfoSection } from "./GameInfoSection";
import { ReviewContent } from "./ReviewContent";
import { ReviewActions } from "./ReviewActions";

const DefaultReviewCardComponent = ({
  review,
  showGameInfo = true,
  onLike,
  onShare,
  onBookmark,
  className,
}: ReviewCardProps) => {
  const {
    isLiked,
    isBookmarked,
    isLikeLoading,
    isBookmarkLoading,
    isShareLoading,
    showFullReview,
    handleLike,
    handleBookmark,
    handleShare,
    toggleFullReview,
  } = useReviewCardActions(review.id, onLike, onShare, onBookmark);

  const isLongReview = review.review_text && review.review_text.length > 200;

  return (
    <AnimatedCard
      className={`group relative overflow-hidden border border-white/5 hover:border-white/10 bg-slate-900/30 backdrop-blur-sm hover:bg-slate-900/50 transition-all duration-300 h-full flex flex-col ${className}`}
    >
      <div className="p-4 flex-1 flex flex-col">
        <ReviewCardHeader 
          user={review.user} 
          createdAt={review.created_at} 
        />

        {showGameInfo && review.game_details && (
          <GameInfoSection
            gameDetails={review.game_details}
            gameId={review.game_id}
            rating={review.rating}
          />
        )}

        {review.review_text && (
          <ReviewContent
            reviewText={review.review_text}
            isLongReview={!!isLongReview}
            showFullReview={showFullReview}
            onToggleFullReview={toggleFullReview}
          />
        )}

        <ReviewActions
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          isLikeLoading={isLikeLoading}
          isBookmarkLoading={isBookmarkLoading}
          isShareLoading={isShareLoading}
          gameId={review.game_id}
          onLike={handleLike}
          onShare={handleShare}
          onBookmark={handleBookmark}
        />
      </div>
    </AnimatedCard>
  );
};

export const DefaultReviewCard = DefaultReviewCardComponent;