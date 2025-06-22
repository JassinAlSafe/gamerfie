import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ReviewCardProps } from "./types";

export function CompactReviewCard({
  review,
  showGameInfo = true,
  className,
}: ReviewCardProps) {
  return (
    <AnimatedCard
      className={`group border border-gray-200/10 hover:border-gray-200/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 ${className}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 ring-1 ring-white/10 flex-shrink-0">
            <AvatarImage 
              src={review.user.avatar_url} 
              className="object-cover"
            />
            <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
              {review.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <Link
                href={`/profile/${review.user.id}`}
                className="font-medium text-white hover:text-white/80 transition-colors text-sm truncate"
              >
                {review.user.username}
              </Link>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= review.rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-white ml-0.5">
                  {review.rating}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-2">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </div>

            {showGameInfo && review.game_details && (
              <Link
                href={`/game/${review.game_id}`}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors line-clamp-1 mb-2 block"
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