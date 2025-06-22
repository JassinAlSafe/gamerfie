import { useMemo } from "react";
import { useReviewsQuery, useReviewsStatsQuery } from "./use-reviews-query";
import { useGameDetails } from "./use-game-details";
import { GameReview, ReviewsStats } from "./types";

// Re-export types for backward compatibility
export type { GameReview, ReviewsStats };

export function useAllReviews(initialReviews?: GameReview[] | null) {
  // Use React Query for better caching and performance
  const reviewsQuery = useReviewsQuery(initialReviews || undefined);
  const statsQuery = useReviewsStatsQuery();
  
  // Flatten all pages of reviews
  const allReviews = useMemo(() => {
    return reviewsQuery.data?.pages.flatMap(page => page.reviews) || [];
  }, [reviewsQuery.data]);

  // Get unique game IDs for fetching game details
  const gameIds = useMemo(() => 
    [...new Set(allReviews.map(review => review.game_id))],
    [allReviews]
  );
  
  const { gameDetails } = useGameDetails(gameIds);
  
  // Progressive loading: Show reviews immediately, add game details as they load
  const reviewsWithGameDetails = useMemo(() => 
    allReviews.map(review => ({
      ...review,
      game_details: gameDetails.get(review.game_id) || {
        name: `Loading game ${review.game_id}...`,
        cover_url: undefined,
        developer: undefined,
        publisher: undefined,
        genres: [],
        release_date: undefined
      }
    })),
    [allReviews, gameDetails]
  );

  // Get total count from the first page
  const totalCount = reviewsQuery.data?.pages[0]?.totalCount || 0;
  
  // Create stats object
  const stats: ReviewsStats = useMemo(() => ({
    totalReviews: totalCount,
    averageRating: statsQuery.data?.averageRating || 0,
    ratingsDistribution: statsQuery.data?.ratingsDistribution || {},
    topGenres: [] // TODO: Calculate from game details when available
  }), [totalCount, statsQuery.data]);

  return {
    reviews: reviewsWithGameDetails,
    stats,
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error?.message || null,
    hasNextPage: reviewsQuery.hasNextPage,
    totalCount,
    refetchReviews: () => reviewsQuery.refetch(),
    loadMoreReviews: () => reviewsQuery.fetchNextPage(),
  };
}