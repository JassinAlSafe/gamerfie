"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { GameStatus } from "@/types/game";
import { LoadingSpinner } from "./loadingSpinner";
import { useFriendsStore } from "@/stores/useFriendsStore";

interface AddToLibraryButtonProps {
  gameId: string;
  gameName: string;
  cover?: string;
  rating?: number;
  releaseDate?: number;
  platforms?: { id: number; name: string }[];
  genres?: { id: number; name: string }[];
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: (status: GameStatus) => void;
}

export function AddToLibraryButton({
  gameId,
  gameName,
  cover,
  rating,
  releaseDate,
  platforms,
  genres,
  variant = "default",
  size = "default",
  className,
  onSuccess,
}: AddToLibraryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { createActivity } = useFriendsStore();

  const handleClick = async () => {
    setIsLoading(true);
    const supabase = createClientComponentClient<Database>();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      // First, ensure game exists in games table
      const { error: gameError } = await supabase.from("games").upsert(
        {
          id: gameId,
          name: gameName,
          cover_url: cover,
          rating,
          first_release_date: releaseDate,
          platforms: platforms ? JSON.stringify(platforms) : null,
          genres: genres ? JSON.stringify(genres) : null,
        },
        { onConflict: "id" }
      );

      if (gameError) throw gameError;

      // Then add to user_games
      const status: GameStatus = "want_to_play";
      const { error: userGameError } = await supabase.from("user_games").upsert(
        {
          user_id: user.id,
          game_id: gameId,
          status,
        },
        { onConflict: "user_id,game_id" }
      );

      if (userGameError) throw userGameError;

      // Create an activity for adding the game
      await createActivity("want_to_play", gameId);

      onSuccess?.(status);
      router.refresh();
    } catch (error) {
      console.error("Error adding game to library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="ml-2">Adding to Library...</span>
        </>
      ) : (
        "Add to Library"
      )}
    </Button>
  );
}
