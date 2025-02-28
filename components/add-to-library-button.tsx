"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { GameStatus } from "@/types/game";
import { LoadingSpinner } from "./loadingSpinner";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useErrorStore } from "@/stores/useErrorStore";
import { useProgressStore } from "@/stores/useProgressStore";
import { toast } from "sonner";
import { checkGameInLibrary } from "@/utils/game-utils";
import { Plus, PlayCircle, CheckCircle, XCircle, Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToLibraryButtonProps {
  gameId: string;
  gameName: string;
  cover?: string;
  rating?: number;
  releaseDate?: number;
  platforms?: Array<{ id: string | number; name: string }>;
  genres?: Array<{ id: string | number; name: string }>;
  summary?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: (status: GameStatus) => void;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  want_to_play: "Want to Play",
  playing: "Currently Playing",
  completed: "Completed",
  dropped: "Dropped",
};

const STATUS_ICONS: Record<GameStatus, React.ReactNode> = {
  want_to_play: <Plus className="w-4 h-4 mr-2" />,
  playing: <PlayCircle className="w-4 h-4 mr-2" />,
  completed: <CheckCircle className="w-4 h-4 mr-2" />,
  dropped: <XCircle className="w-4 h-4 mr-2" />,
};

const STATUS_VARIANTS: Record<
  GameStatus,
  "default" | "outline" | "secondary" | "ghost"
> = {
  want_to_play: "default",
  playing: "secondary",
  completed: "outline",
  dropped: "ghost",
};

export function AddToLibraryButton({
  gameId,
  gameName,
  cover,
  rating,
  releaseDate,
  platforms,
  genres,
  summary,
  variant = "default",
  size = "default",
  className,
  onSuccess,
}: AddToLibraryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [playTime, setPlayTime] = useState<number | undefined>();
  const [completionPercentage, setCompletionPercentage] = useState<
    number | undefined
  >();
  const [pendingStatus, setPendingStatus] = useState<GameStatus | null>(null);

  const router = useRouter();
  const { user } = useAuthStore();
  const { createActivity } = useFriendsStore();
  const { addGame } = useLibraryStore();
  const { updateGameStatus, updateProgress } = useProgressStore();
  const { addError } = useErrorStore();

  // Check if game is in library on mount or when user/gameId changes
  useEffect(() => {
    const checkLibrary = async () => {
      if (!user) return;
      try {
        const result = await checkGameInLibrary(gameId, user.id);
        if (result) {
          setIsInLibrary(true);
          setGameStatus(result.status as GameStatus);
        }
      } catch (error) {
        console.error("Error checking library:", error);
      }
    };

    checkLibrary();
  }, [gameId, user]);

  // Handle progress submission
  const handleProgressSubmit = useCallback(async () => {
    try {
      if (!user || !pendingStatus) return;

      setIsLoading(true);

      // First update the progress
      await updateProgress(user.id, gameId, {
        play_time: playTime,
        completion_percentage: completionPercentage,
      });

      // Then update the status
      await updateGameStatus(user.id, gameId, pendingStatus);
      setGameStatus(pendingStatus);

      // Try to create activity
      try {
        await createActivity(
          pendingStatus === "completed" ? "completed" : "started_playing",
          gameId
        );
      } catch (activityError: any) {
        if (activityError.message?.includes("Please wait")) {
          const minutes = activityError.message.match(/\d+/)?.[0] || "some";
          toast.error(
            `Progress updated, but we couldn't post the activity yet. Please wait ${minutes} minutes before sharing another update for this game.`
          );
        } else {
          console.error("Error creating activity:", activityError);
          toast.error(
            "Progress updated, but we couldn't share the activity with your friends."
          );
        }
      }

      toast.success(
        `Game progress and status updated to ${STATUS_LABELS[pendingStatus]}`
      );
      onSuccess?.(pendingStatus);
      router.refresh();
      setShowProgressDialog(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating progress:", error);
      addError("api", "Failed to update game progress");
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    pendingStatus,
    updateProgress,
    gameId,
    playTime,
    completionPercentage,
    updateGameStatus,
    createActivity,
    onSuccess,
    router,
    addError,
  ]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (newStatus: GameStatus) => {
      if (!user) {
        addError("auth", "Please sign in to update game status");
        router.push("/signin");
        return;
      }

      // Don't update if status hasn't changed
      if (gameStatus === newStatus) {
        toast.info(`Game is already marked as ${STATUS_LABELS[newStatus]}`);
        return;
      }

      // For completed status, show progress dialog
      if (newStatus === "completed") {
        setPendingStatus(newStatus);
        setShowProgressDialog(true);
        return;
      }

      // For other statuses, proceed as before
      try {
        setIsLoading(true);
        await updateGameStatus(user.id, gameId, newStatus);
        setGameStatus(newStatus);

        if (newStatus === "playing") {
          try {
            await createActivity("started_playing", gameId);
          } catch (activityError: any) {
            if (activityError.message?.includes("Please wait")) {
              const minutes = activityError.message.match(/\d+/)?.[0] || "some";
              toast.error(
                `Status updated, but we couldn't post the activity yet. Please wait ${minutes} minutes before sharing another update for this game.`
              );
            } else {
              console.error("Error creating activity:", activityError);
              toast.error(
                "Status updated, but we couldn't share the activity with your friends."
              );
            }
          }
        }

        toast.success(`Game status updated to ${STATUS_LABELS[newStatus]}`);
        onSuccess?.(newStatus);
        router.refresh();
      } catch (error) {
        console.error("Error updating status:", error);
        addError("api", "Failed to update game status");
        setGameStatus(gameStatus); // Revert the status on error
      } finally {
        setIsLoading(false);
      }
    },
    [
      user,
      gameStatus,
      updateGameStatus,
      gameId,
      createActivity,
      onSuccess,
      router,
      addError,
    ]
  );

  // Handle add to library click
  const handleClick = useCallback(async () => {
    try {
      if (!user) {
        addError("auth", "Please sign in to add games to your library");
        router.push("/signin");
        return;
      }

      setIsLoading(true);

      // Format platforms and genres consistently
      const formattedPlatforms = Array.isArray(platforms)
        ? platforms
        : typeof platforms === "string"
        ? JSON.parse(platforms)
        : [];

      const formattedGenres = Array.isArray(genres)
        ? genres
        : typeof genres === "string"
        ? JSON.parse(genres)
        : [];

      // Format game data consistently
      const gameData = {
        id: gameId,
        name: gameName,
        title: gameName,
        coverImage: cover || undefined,
        cover_url: cover || null,
        rating,
        first_release_date: releaseDate,
        platforms: formattedPlatforms,
        genres: formattedGenres,
        summary,
      };

      // Add game to library using LibraryStore
      try {
        // First, store the game data in the games table
        const gameRecord = {
          id: gameId,
          name: gameName,
          cover_url: cover,
          genres: formattedGenres,
          platforms: formattedPlatforms,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          summary: summary,
          first_release_date: releaseDate,
        };

        console.log("Adding game to library with data:", gameRecord);

        // Add game to library using LibraryStore
        const addedGame = await addGame(gameRecord);

        console.log("Game added to library:", addedGame);
        toast.success("Game added to library");

        // Create activity for adding to library
        try {
          await createActivity("want_to_play", gameId);
        } catch (activityError) {
          console.error("Error creating activity:", activityError);
          // Don't fail the whole operation if activity creation fails
          toast.error("Added to library, but couldn't create activity");
        }

        setIsInLibrary(true);
        setGameStatus("want_to_play");
        onSuccess?.("want_to_play");
        router.refresh();
      } catch (error: any) {
        console.error("Error adding game:", error);

        // If the error is a duplicate key error, update the UI state
        if (
          error.code === "23505" ||
          (error.message && error.message.includes("duplicate"))
        ) {
          setIsInLibrary(true);
          const result = await checkGameInLibrary(gameId, user.id);
          if (result) {
            setGameStatus(result.status as GameStatus);
          }
          toast.info("Game is already in your library", {
            description: `Current status: ${result?.status || "unknown"}`,
          });
        } else {
          addError(
            "api",
            `Failed to add game: ${error.message || "Unknown error"}`
          );
          throw error;
        }
      }
    } catch (error) {
      console.error("Error:", error);
      addError("unknown", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    addError,
    router,
    platforms,
    genres,
    gameId,
    gameName,
    cover,
    rating,
    releaseDate,
    summary,
    addGame,
    createActivity,
    onSuccess,
  ]);

  // Handle dialog close
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setShowProgressDialog(open);
    if (!open) {
      // Reset pending status when dialog is closed
      setPendingStatus(null);
    }
  }, []);

  // Memoize input handlers to prevent unnecessary re-renders
  const handlePlayTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlayTime(e.target.value ? parseInt(e.target.value, 10) : undefined);
    },
    []
  );

  const handleCompletionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCompletionPercentage(
        e.target.value ? parseInt(e.target.value, 10) : undefined
      );
    },
    []
  );

  // Determine button appearance based on status
  const buttonText = useMemo(
    () =>
      isInLibrary ? STATUS_LABELS[gameStatus as GameStatus] : "Add to Library",
    [isInLibrary, gameStatus]
  );

  const buttonIcon = useMemo(
    () =>
      isInLibrary ? (
        STATUS_ICONS[gameStatus as GameStatus]
      ) : (
        <Library className="w-4 h-4 mr-2" />
      ),
    [isInLibrary, gameStatus]
  );

  const buttonVariant = useMemo(
    () => (isInLibrary ? STATUS_VARIANTS[gameStatus as GameStatus] : variant),
    [isInLibrary, gameStatus, variant]
  );

  return (
    <>
      {isInLibrary ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={buttonVariant}
              size={size}
              disabled={isLoading}
              className={cn(
                "min-w-[140px] h-10 transition-all duration-200 font-medium",
                "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                "border-none text-white shadow-md hover:shadow-lg",
                "relative overflow-hidden group",
                className
              )}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                buttonIcon
              )}
              <span className="relative z-10">{buttonText}</span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-gray-900 border-gray-800 text-white"
          >
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status as GameStatus)}
                disabled={isLoading || gameStatus === status}
                className={cn(
                  "flex items-center cursor-pointer py-2.5",
                  "hover:bg-gray-800 focus:bg-gray-800",
                  gameStatus === status && "bg-purple-500/20 text-purple-300"
                )}
              >
                {STATUS_ICONS[status as GameStatus]}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant={buttonVariant}
          size={size}
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "min-w-[140px] h-10 transition-all duration-200 font-medium",
            "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
            "border-none text-white shadow-md hover:shadow-lg",
            "relative overflow-hidden group",
            className
          )}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            buttonIcon
          )}
          <span className="relative z-10">{buttonText}</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Game Progress</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your progress for {gameName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="playTime" className="text-right">
                Play Time (hours)
              </Label>
              <Input
                id="playTime"
                type="number"
                min="0"
                value={playTime || ""}
                onChange={handlePlayTimeChange}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="completion" className="text-right">
                Completion %
              </Label>
              <Input
                id="completion"
                type="number"
                min="0"
                max="100"
                value={completionPercentage || ""}
                onChange={handleCompletionChange}
                className="col-span-3 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleProgressSubmit}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Progress"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
