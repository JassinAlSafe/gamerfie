"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { GameReview } from "./game-review";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ScrollText } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  game_id: string;
  rating: number;
  review_text: string;
  game_details?: {
    name: string;
    cover?: {
      url: string;
    };
  };
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchReviews();
  }, []);

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

  const filteredReviews = reviews.filter((review) =>
    review.game_details?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No reviews match your search"
                : "Start reviewing games in your library"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <GameReview
              key={review.game_id}
              gameId={review.game_id}
              gameName={review.game_details?.name || `Game ${review.game_id}`}
              initialRating={review.rating}
              initialReview={review.review_text}
              onReviewUpdate={fetchReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}
