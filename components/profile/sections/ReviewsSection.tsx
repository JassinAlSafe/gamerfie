import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { JournalEntry } from "@/types/journal";
import { formatDisplayDate } from "@/utils/date-formatting";

interface ReviewsSectionProps {
  reviews: JournalEntry[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Recent Reviews
        </CardTitle>
        <Link
          href="/profile/journal"
          className="text-sm text-yellow-400 hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-800 pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                    {review.game?.cover_url ? (
                      <Image
                        src={review.game.cover_url}
                        alt={review.game.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {review.game?.name.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">
                        {review.game?.name || "Unknown Game"}
                      </p>
                      {review.rating && (
                        <span className="text-sm bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded">
                          {review.rating}/10
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                      {review.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDisplayDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            No reviews yet. Write a review to see it here!
          </p>
        )}
      </CardContent>
    </Card>
  );
};