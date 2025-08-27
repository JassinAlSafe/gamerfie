import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Edit3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { JournalEntry } from "@/types/journal";
import { formatDisplayDate } from "@/utils/date-formatting";
import { cn } from "@/lib/utils";

interface ReviewsSectionProps {
  reviews: JournalEntry[];
}

export const ReviewsSection = memo<ReviewsSectionProps>(({ reviews }) => {
  const hasReviews = reviews && reviews.length > 0;
  const displayReviews = reviews.slice(0, 3);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating / 2 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
        )}
      />
    ));
  };

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Recent Reviews</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasReviews ? `${reviews.length} game reviews` : 'Your thoughts on games'}
              </p>
            </div>
          </div>
          
          {/* Action button */}
          <Link href="/profile/journal">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "profile-nav-item touch-feedback",
                "text-gray-400 hover:text-white hover:bg-white/10",
                "transition-all duration-200 rounded-lg group/btn"
              )}
            >
              {hasReviews ? (
                <>
                  View All
                  <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Write Review
                  <Edit3 className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </Link>
        </div>
        {/* Content */}
        {hasReviews ? (
          <div className="space-y-3">
            {displayReviews.map((review, index) => (
              <div
                key={review.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-xl",
                  "hover:bg-white/5 transition-all duration-200 group/review"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Game Cover */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-gray-700/50 group-hover/review:ring-yellow-400/50 transition-all duration-200">
                    {review.game?.cover_url ? (
                      <Image
                        src={review.game.cover_url}
                        alt={review.game?.name || "Game"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover group-hover/review:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white font-medium">
                        {review.game?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate group-hover/review:text-yellow-100 transition-colors">
                      {review.game?.name || "Unknown Game"}
                    </h4>
                    {review.rating && (
                      <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-0.5 rounded-lg">
                        {renderStars(review.rating)}
                        <span className="text-xs font-medium text-yellow-400 ml-1">
                          {review.rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {review.content && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-1">
                      {review.content}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {formatDisplayDate(review.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Show remaining reviews count */}
            {reviews.length > 3 && (
              <div className="pt-2 border-t border-gray-700/30">
                <Link href="/profile/journal">
                  <div className="text-center py-2 text-xs text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">
                    +{reviews.length - 3} more review{reviews.length - 3 !== 1 ? 's' : ''}
                  </div>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <Edit3 className="h-6 w-6 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Share Your Thoughts
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Write reviews to help other gamers discover great experiences.
              </p>
            </div>
            
            {/* Call-to-action */}
            <div className="pt-2">
              <Link href="/games">
                <div className="inline-flex items-center text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Browse games to review
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ReviewsSection.displayName = 'ReviewsSection';