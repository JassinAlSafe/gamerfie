"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchUserReviews } from "@/lib/api";

interface ReviewsTabProps {
  userId: string;
}

export function ReviewsTab({ userId }: ReviewsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery(
    ["userReviews", userId, page],
    () => fetchUserReviews(userId, page),
    { keepPreviousData: true }
  );

  if (isLoading) return <div>Loading reviews...</div>;
  if (error) return <div>Error loading reviews</div>;

  return (
    <div className="space-y-4">
      {data?.reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle>{review.game.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Rating: {review.rating}/10</p>
            <p>{review.content}</p>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between">
        <Button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          Previous Page
        </Button>
        <Button
          onClick={() => setPage((old) => old + 1)}
          disabled={!data?.hasMore}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
}
