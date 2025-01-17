"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { GameStatus } from "@/types/game";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useGameProgressStore } from "@/stores/useGameProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface GameLibraryActionsProps {
  gameId: string;
  gameName: string;
  cover?: string;
  rating?: number;
  releaseDate?: number;
  platforms?: { id: number; name: string }[];
  genres?: { id: number; name: string }[];
}

export function GameLibraryActions({
  gameId,
  gameName,
  cover,
  rating,
  releaseDate,
  platforms,
  genres,
}: GameLibraryActionsProps) {
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [matchingChallenges, setMatchingChallenges] = useState<any[]>([]);
  const { user } = useAuthStore();
  const { createActivity } = useFriendsStore();
  const { userChallenges } = useChallengesStore();
  const {
    isLoading,
    currentStatus,
    progress,
    updateGameStatus,
    updateProgress: updateGameProgress,
    fetchGameProgress,
  } = useGameProgressStore();

  useEffect(() => {
    if (user && gameId) {
      fetchGameProgress(gameId);
    }
  }, [gameId, user, fetchGameProgress]);

  useEffect(() => {
    // Find matching active challenges based on game genres
    const activeMatches = userChallenges.filter((challenge) => {
      if (challenge.status !== "active") return false;
      if (!challenge.requirements?.genre) return true;

      const requiredGenre = challenge.requirements.genre.toLowerCase();
      return genres?.some((g) => g.name.toLowerCase() === requiredGenre);
    });

    setMatchingChallenges(activeMatches);
  }, [genres, userChallenges]);

  const handleStatusUpdate = async (newStatus: GameStatus) => {
    try {
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      await updateGameStatus(gameId, newStatus, {
        name: gameName,
        cover_url: cover,
        rating,
        first_release_date: releaseDate,
        platforms: platforms ? JSON.stringify(platforms) : null,
        genres: genres ? JSON.stringify(genres) : null,
      });

      // Create activity for significant status changes
      if (newStatus === "completed" || newStatus === "playing") {
        const activityType =
          newStatus === "completed" ? "completed" : "started_playing";
        await createActivity(activityType, gameId);
      }

      if (newStatus === "completed") {
        // If completed, show matching challenges
        if (matchingChallenges.length > 0) {
          toast.message(
            `This game counts towards ${matchingChallenges.length} active challenges!`,
            {
              description: matchingChallenges.map((c) => c.title).join(", "),
            }
          );

          // Update progress for each matching challenge
          for (const challenge of matchingChallenges) {
            try {
              const response = await fetch(
                `/api/challenges/${challenge.id}/progress`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                }
              );

              if (!response.ok) {
                console.error(
                  `Failed to update progress for challenge ${challenge.title}`
                );
              }
            } catch (error) {
              console.error(`Error updating challenge progress:`, error);
            }
          }
        }
      }

      toast.success(
        newStatus === "completed"
          ? "Game marked as completed!"
          : `Game status updated to ${newStatus}!`
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update game status");
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      await updateGameProgress(gameId, newProgress);
      toast.success("Progress updated successfully!");

      // If progress is 100%, suggest marking as completed
      if (newProgress === 100 && currentStatus !== "completed") {
        toast.message("Would you like to mark this game as completed?", {
          action: {
            label: "Mark Completed",
            onClick: () => handleStatusUpdate("completed"),
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update progress");
    } finally {
      setShowProgressDialog(false);
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : currentStatus || "Add to Library"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusUpdate("playing")}>
            Playing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("want_to_play")}>
            Want to Play
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("dropped")}>
            Dropped
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentStatus !== "want_to_play" && currentStatus !== "dropped" && (
        <Button
          variant="outline"
          onClick={() => setShowProgressDialog(true)}
          disabled={isLoading}
        >
          {progress}% Complete
        </Button>
      )}

      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update your progress for {gameName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Slider
              value={[progress || 0]}
              onValueChange={([value]) => handleProgressUpdate(value)}
              max={100}
              step={1}
            />
            <div className="mt-2 text-center">{progress || 0}% Complete</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
