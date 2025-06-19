import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CompactRating } from "@/components/ui/rating-stars";
import { ReviewCardProps } from "./types";

export function CompactReviewCard({
  review,
  showGameInfo = true,
  className,
}: ReviewCardProps) {
  return (
    <AnimatedCard
      className={`group border border-gray-800/50 hover:border-purple-500/30 ${className}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
            <AvatarImage src={review.user.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
              {review.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Link
                  href={`/profile/${review.user.id}`}
                  className="font-medium text-white hover:text-purple-400 transition-colors text-sm"
                >
                  {review.user.username}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <CompactRating rating={review.rating} />
                  <span className="text-xs text-gray-400">
                    {format(new Date(review.created_at), "MMM d")}
                  </span>
                </div>
              </div>
            </div>

            {showGameInfo && review.game_details && (
              <Link
                href={`/game/${review.game_id}`}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors line-clamp-1 mb-2"
              >
                {review.game_details.name}
              </Link>
            )}

            {review.review_text && (
              <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                {review.review_text}
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
