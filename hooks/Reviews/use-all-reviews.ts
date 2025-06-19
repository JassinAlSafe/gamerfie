import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { UnifiedGameService } from '@/services/unifiedGameService';
import toast from "react-hot-toast";

export interface GameReview {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  game_details?: {
    name: string;
    cover_url?: string;
    developer?: string;
    publisher?: string;
    genres?: string[];
    release_date?: string;
  };
}

export interface ReviewsStats {
  totalReviews: number;
  averageRating: number;
  ratingsDistribution: Record<number, number>;
  topGenres: Array<{ genre: string; count: number }>;
}

export function useAllReviews() {
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user to include their private reviews
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Fetch reviews from journal_entries (public reviews only, plus user's own reviews)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          game_id,
          user_id,
          rating,
          content,
          is_public,
          created_at,
          updated_at,
          user:profiles!user_id(id, username, avatar_url)
        `)
        .eq('type', 'review')
        .or(`is_public.eq.true${currentUser ? `,user_id.eq.${currentUser.id}` : ''}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Fetch game details for each review
      const reviewsWithGameDetails = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            const gameData = await UnifiedGameService.getGameDetails(review.game_id.toString());
            
            return {
              ...review,
              review_text: review.content, // Map content to review_text for interface compatibility
              user: Array.isArray(review.user) ? review.user[0] : review.user, // Fix user property type
              game_details: gameData ? {
                name: gameData.name || `Game ${review.game_id}`,
                cover_url: gameData.cover_url || gameData.cover?.url,
                developer: gameData.involved_companies?.[0]?.company?.name,
                publisher: gameData.involved_companies?.find(c => c.publisher)?.company?.name,
                genres: gameData.genres?.map(g => g.name) || [],
                release_date: gameData.first_release_date 
                  ? new Date(gameData.first_release_date * 1000).toISOString().split('T')[0]
                  : undefined
              } : {
                name: `Game ${review.game_id}`,
                cover_url: undefined,
                developer: "Unknown Developer",
                publisher: "Unknown Publisher",
                genres: ["Unknown"],
                release_date: undefined
              }
            };
          } catch (error) {
            console.error(`Error fetching game details for ${review.game_id}:`, error);
                        return {
              ...review,
              review_text: review.content, // Map content to review_text for interface compatibility
              user: Array.isArray(review.user) ? review.user[0] : review.user, // Fix user property type
              game_details: {
                name: `Game ${review.game_id}`,
                cover_url: undefined,
                developer: "Unknown Developer",
                publisher: "Unknown Publisher",
                genres: ["Unknown"],
                release_date: undefined
              }
            };
          }
        })
      );

      setReviews(reviewsWithGameDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load reviews";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate statistics
  const stats: ReviewsStats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0,
    ratingsDistribution: reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    topGenres: (() => {
      const genreCounts = reviews.reduce((acc, review) => {
        (review.game_details?.genres || []).forEach(genre => {
          if (genre !== "Unknown") {
            acc[genre] = (acc[genre] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));
    })()
  };

  return {
    reviews,
    stats,
    isLoading,
    error,
    refetchReviews: fetchReviews,
  };
}