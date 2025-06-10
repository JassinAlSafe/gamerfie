import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { JournalEntry } from "@/stores/useJournalStore";

interface ReviewsCardProps {
  reviews: JournalEntry[];
  onViewAll: () => void;
}

export function ReviewsCard({ reviews, onViewAll }: ReviewsCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          Recent Reviews
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-purple-400 hover:text-purple-300"
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
          >
            {review.game && (
              <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={
                    review.game.cover_url
                      ? getCoverImageUrl(review.game.cover_url)
                      : "/images/placeholders/game-cover.jpg"
                  }
                  alt={`Cover for ${review.game.name}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                  quality={90}
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white line-clamp-1">
                {review.game?.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-4 rounded-sm ${
                        i < (review.rating || 0)
                          ? "bg-white"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-white">
                  {review.rating}/10
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {review.content}
              </p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-gray-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
} 