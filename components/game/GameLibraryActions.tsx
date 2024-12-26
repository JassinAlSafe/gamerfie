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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { GameStatus } from "@/types/game";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { toast } from "sonner";
import { ActivityType } from "@/types/friend";

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<GameStatus | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [matchingChallenges, setMatchingChallenges] = useState<any[]>([]);
  const { createActivity } = useFriendsStore();
  const { userChallenges } = useChallengesStore();

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchCurrentStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_games")
        .select("status, progress")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .single();

      if (data) {
        setCurrentStatus(data.status as GameStatus);
        setProgress(data.progress || 0);
      }
    };

    fetchCurrentStatus();
  }, [gameId]);

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
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      // First ensure game exists in games table
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

      // Update user_games table
      const { error: userGameError } = await supabase.from("user_games").upsert(
        {
          user_id: user.id,
          game_id: gameId,
          status: newStatus,
          progress: newStatus === "completed" ? 100 : progress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,game_id" }
      );

      if (userGameError) throw userGameError;

      // Create activity for significant status changes
      if (newStatus === "completed" || newStatus === "playing") {
        const activityType: ActivityType =
          newStatus === "completed" ? "completed" : "started_playing";
        await createActivity(activityType, gameId);
      }

      setCurrentStatus(newStatus);
      if (newStatus === "completed") setProgress(100);

      toast.success(
        newStatus === "completed"
          ? "Game marked as completed!"
          : `Game status updated to ${newStatus}!`
      );

      // If completed, show matching challenges
      if (newStatus === "completed" && matchingChallenges.length > 0) {
        toast.message(
          `This game counts towards ${matchingChallenges.length} active challenges!`,
          {
            description: matchingChallenges.map((c) => c.title).join(", "),
          }
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update game status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const { error } = await supabase.from("user_games").upsert(
        {
          user_id: user.id,
          game_id: gameId,
          status: currentStatus || "playing",
          progress: newProgress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,game_id" }
      );

      if (error) throw error;

      setProgress(newProgress);
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
      setIsLoading(false);
      setShowProgressDialog(false);
    }
  };

  if (!currentStatus) {
    return (
      <Button
        onClick={() => handleStatusUpdate("want_to_play")}
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

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              `Status: ${currentStatus}`
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusUpdate("want_to_play")}>
            Want to Play
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("playing")}>
            Currently Playing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
            Completed
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
              value={[progress]}
              onValueChange={([value]) => setProgress(value)}
              max={100}
              step={1}
            />
            <div className="mt-2 text-center">{progress}% Complete</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowProgressDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleProgressUpdate(progress)}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Save Progress"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
