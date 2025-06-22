import { useMemo } from "react";
import { GameReview } from "./types";

export interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingsDistribution: Record<number, number>;
  topGenres: Array<{ genre: string; count: number }>;
}

export function useReviewsStats(reviews: GameReview[], totalCount: number): ReviewsStats {
  return useMemo(() => {
    const ratingsDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const genreCounts = reviews.reduce((acc, review) => {
      (review.game_details?.genres || []).forEach(genre => {
        if (genre !== "Unknown") {
          acc[genre] = (acc[genre] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    return {
      totalReviews: totalCount,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0,
      ratingsDistribution,
      topGenres
    };
  }, [reviews, totalCount]);
}