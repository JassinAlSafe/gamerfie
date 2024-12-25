"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { GameStatus } from "@/types/game";
import { LoadingSpinner } from "./loadingSpinner";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { toast } from "sonner";
import { ActivityType } from "@/types/friend";

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
  status?: GameStatus;
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
  status = "want_to_play",
}: AddToLibraryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { createActivity } = useFriendsStore();
  const { userChallenges, updateProgress } = useChallengesStore();

  const handleClick = async () => {
    try {
      setIsLoading(true);
      console.log("Starting process...");
      toast.message("Starting process...");

      const supabase = createClientComponentClient<Database>();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in first");
        router.push("/signin");
        return;
      }

      console.log("User authenticated");
      toast.message("User authenticated");

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

      if (gameError) {
        console.error("Error upserting game:", gameError);
        toast.error("Failed to save game data");
        throw gameError;
      }

      console.log("Game data saved");
      toast.message("Game data saved");

      // Then add to user_games
      const { error: userGameError } = await supabase.from("user_games").upsert(
        {
          user_id: user.id,
          game_id: gameId,
          status,
        },
        { onConflict: "user_id,game_id" }
      );

      if (userGameError) {
        console.error("Error updating user_game:", userGameError);
        toast.error("Failed to update game status");
        throw userGameError;
      }

      console.log("Game status updated");
      toast.message("Game status updated");

      // Create activity
      const activityType: ActivityType =
        status === "completed"
          ? "completed"
          : status === "playing"
          ? "started_playing"
          : "want_to_play";

      await createActivity(activityType, gameId);
      console.log("Activity created");
      toast.message("Activity created");

      // Handle challenges if game is completed
      if (status === "completed") {
        const activeGameChallenges = userChallenges.filter(
          (challenge) =>
            challenge.status === "active" &&
            (challenge.goal_type === "complete_games" ||
              challenge.goal_type === "play_time" ||
              challenge.goal_type === "review_games")
        );

        console.log("Processing challenges:", activeGameChallenges.length);
        toast.message(`Processing ${activeGameChallenges.length} challenges`);

        for (const challenge of activeGameChallenges) {
          const participant = challenge.participants.find(
            (p) => p.user.id === user.id
          );

          if (participant && challenge.goal_type === "complete_games") {
            const genreRequirement =
              challenge.requirements?.genre?.toLowerCase();
            const gameGenres = genres?.map((g) => g.name.toLowerCase()) || [];

            // Helper function to normalize genre names
            const normalizeGenre = (genre: string) => {
              genre = genre.toLowerCase();
              if (
                genre.includes("role-playing") ||
                genre.includes("rpg") ||
                genre === "role playing game"
              ) {
                return "rpg";
              }
              return genre;
            };

            // Normalize all game genres
            const normalizedGameGenres = gameGenres.map(normalizeGenre);
            const normalizedRequirement = genreRequirement
              ? normalizeGenre(genreRequirement)
              : null;

            console.log("Challenge:", {
              id: challenge.id,
              title: challenge.title,
              requirements: challenge.requirements,
              genreRequirement,
              normalizedRequirement,
            });

            console.log("Game genres:", {
              original: gameGenres,
              normalized: normalizedGameGenres,
            });

            const matchesRequirement =
              !normalizedRequirement ||
              normalizedGameGenres.includes(normalizedRequirement);

            console.log("Genre match result:", {
              matchesRequirement,
              reason: !normalizedRequirement
                ? "No genre requirement"
                : matchesRequirement
                ? "Genre matches requirement"
                : "Genre does not match requirement",
            });

            if (matchesRequirement) {
              const currentCompleted = Math.floor(
                (participant.progress / 100) * challenge.goal_target
              );
              const newCompleted = currentCompleted + 1;
              const newProgress = Math.min(
                100,
                (newCompleted * 100) / challenge.goal_target
              );

              const { error: updateError } = await supabase
                .from("challenge_participants")
                .update({ progress: newProgress })
                .eq("challenge_id", challenge.id)
                .eq("user_id", user.id);

              if (updateError) {
                console.error("Error updating challenge:", updateError);
                toast.error("Failed to update challenge progress");
                throw updateError;
              }

              await updateProgress(challenge.id, newProgress);
              console.log("Challenge updated:", challenge.title);
              toast.success(`Challenge progress updated: ${challenge.title}`);
            }
          }
        }
      }

      onSuccess?.(status);
      router.refresh();

      toast.success(
        status === "completed"
          ? "Game marked as completed!"
          : "Game added to library!"
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
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
          <span className="ml-2">
            {status === "completed"
              ? "Marking as Completed..."
              : "Adding to Library..."}
          </span>
        </>
      ) : status === "completed" ? (
        "Mark as Completed"
      ) : (
        "Add to Library"
      )}
    </Button>
  );
}
