import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Review } from "@/types/review";
import toast from "react-hot-toast";
import { UnifiedGameService } from '@/services/unifiedGameService';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchReviews = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reviews, error: reviewsError } = await supabase
        .from("game_reviews")
        .select("*")
        .eq("user_id", user.id);

      if (reviewsError) throw reviewsError;

      // Fetch game details for each review using UnifiedGameService
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          try {
            const gameData = await UnifiedGameService.getGameDetails(review.game_id.toString());
            
            return {
              ...review,
              game_details: {
                name: gameData?.name || `Game ${review.game_id}`,
                cover: gameData?.cover,
              },
            };
          } catch (error) {
            console.error(
              `Error fetching details for game ${review.game_id}:`,
              error
            );
            return {
              ...review,
              game_details: {
                name: `Game ${review.game_id}`,
              },
            };
          }
        })
      );

      setReviews(reviewsWithDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    isLoading,
    refetchReviews: fetchReviews,
  };
} 