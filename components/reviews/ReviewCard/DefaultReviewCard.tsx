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
  } = useReviewCardActions(
    review.id, 
    review.is_liked || false,
    review.is_bookmarked || false,
    onLike, 
    onShare, 
    onBookmark
  );

  const isLongReview = review.review_text && review.review_text.length > 150;

  return (
    <AnimatedCard
      className={`group relative overflow-hidden border border-white/5 hover:border-white/10 bg-slate-900/30 backdrop-blur-sm hover:bg-slate-900/50 transition-all duration-500 ease-out ${
        showFullReview ? 'h-auto' : 'h-[480px]'
      } flex flex-col ${className}`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header - Fixed Height */}
        <div className="flex-shrink-0">
          <ReviewCardHeader 
            user={review.user} 
            createdAt={review.created_at} 
          />
        </div>

        {/* Game Info - Fixed Height */}
        {showGameInfo && review.game_details && (
          <div className="flex-shrink-0">
            <GameInfoSection
              gameDetails={review.game_details}
              gameId={review.game_id}
              rating={review.rating}
            />
          </div>
        )}

        {/* Review Content - Flexible Height */}
        {review.review_text && (
          <div className={`flex-1 ${showFullReview ? 'mb-4' : 'mb-4 min-h-0'}`}>
            <ReviewContent
              reviewText={review.review_text}
              isLongReview={!!isLongReview}
              showFullReview={showFullReview}
              onToggleFullReview={toggleFullReview}
            />
          </div>
        )}

        {/* Actions - Fixed Height at Bottom */}
        <div className="flex-shrink-0 mt-auto">
          <ReviewActions
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            isLikeLoading={isLikeLoading}
            isBookmarkLoading={isBookmarkLoading}
            isShareLoading={isShareLoading}
            gameId={review.game_id}
            likesCount={review.likes_count}
            bookmarksCount={review.bookmarks_count}
            helpfulnessScore={review.helpfulness_score}
            onLike={handleLike}
            onShare={handleShare}
            onBookmark={handleBookmark}
          />
        </div>
      </div>
    </AnimatedCard>
  );
};

export const DefaultReviewCard = DefaultReviewCardComponent;