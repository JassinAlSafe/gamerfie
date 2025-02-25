"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/text/textarea";
import { Star, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Icons } from "./ui/icons";

interface GameReviewProps {
  gameId: string;
  gameName: string;
  initialRating?: number;
  initialReview?: string;
  onReviewUpdate?: () => void;
}

export function GameReview({
  gameId,
  gameName,
  initialRating,
  initialReview,
  onReviewUpdate,
}: GameReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(initialRating || 0);
  const [review, setReview] = useState(initialReview || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to review games");
        return;
      }

      const { error } = await supabase.from("game_reviews").upsert({
        user_id: user.id,
        game_id: gameId,
        rating,
        review_text: review,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Review saved successfully");
      setIsEditing(false);
      if (onReviewUpdate) onReviewUpdate();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("game_reviews")
        .delete()
        .match({ user_id: user.id, game_id: gameId });

      if (error) throw error;

      toast.success("Review deleted successfully");
      setRating(0);
      setReview("");
      if (onReviewUpdate) onReviewUpdate();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange?: (_rating: number) => void;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`focus:outline-none ${
              !onChange ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{gameName}</span>
          <div className="flex gap-2">
            {!isEditing && (rating > 0 || review) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="space-y-2">
              <Label>Review</Label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                className="min-h-[100px]"
              />
            </div>
          </>
        ) : (
          <>
            {rating > 0 ? (
              <div className="space-y-4">
                <StarRating value={rating} />
                {review && (
                  <p className="text-sm text-muted-foreground">{review}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No review yet</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Write a Review
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRating(initialRating || 0);
              setReview(initialReview || "");
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Review
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
