"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserReviews } from "@/lib/api";
import { Star } from "lucide-react";

interface ReviewsTabProps {
  userId: string;
}

export function ReviewsTab({ userId }: ReviewsTabProps) {
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userReviews", userId],
    queryFn: () => fetchUserReviews(userId)
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="h-6 w-3/4 bg-gray-800 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-1/4 bg-gray-800 animate-pulse rounded mb-2" />
              <div className="h-4 w-full bg-gray-800 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );

  if (error) return <div className="text-red-500">Error loading reviews</div>;

  return (
    <div className="space-y-4">
      {reviews?.map((review) => (
        <Card key={review.id} className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              {review.game.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              {[...Array(10)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < review.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-300">{review.rating}/10</span>
            </div>
            <p className="text-gray-300">{review.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
