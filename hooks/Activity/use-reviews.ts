import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Review } from "@/types/review";
import toast from "react-hot-toast";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

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

      // Fetch game details for each review
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          try {
            const response = await fetch("/api/games/details", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ gameId: review.game_id }),
            });

            if (!response.ok) throw new Error("Failed to fetch game details");

            const gameData = await response.json();
            return {
              ...review,
              game_details: {
                name: gameData[0].name,
                cover: gameData[0].cover,
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