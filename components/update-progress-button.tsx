"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useGameProgressStore } from "@/stores/useGameProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { CompletionDialog } from "@/components/game/dialogs/CompletionDialog";
import { toast } from "sonner";
import { Game } from "@/types/game";
import { BarChart2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpdateProgressButtonProps {
  gameId: string;
  gameName: string;
  game: Game;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UpdateProgressButton({
  gameId,
  gameName,
  game,
  variant = "secondary",
  size = "default",
  className,
}: UpdateProgressButtonProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user } = useAuthStore();
  const {
    isLoading,
    progress,
    playTime,
    achievementsCompleted,
    updateProgress,
    fetchGameProgress,
  } = useGameProgressStore();

  React.useEffect(() => {
    if (user && gameId) {
      fetchGameProgress(gameId);
    }
  }, [user, gameId, fetchGameProgress]);

  const handleProgressUpdate = async (updates: {
    progress?: number;
    playTime?: number;
    achievementsCompleted?: number;
  }) => {
    if (!user) {
      toast.error("Please sign in to update progress");
      return;
    }

    try {
      await updateProgress(gameId, {
        completion_percentage: updates.progress ?? progress,
        play_time: updates.playTime ?? playTime,
        achievements_completed:
          updates.achievementsCompleted ?? achievementsCompleted,
      });

      toast.success("Progress updated successfully!");
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update progress"
      );
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={() => setDialogOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BarChart2 className="h-4 w-4" />
        )}
        Update Progress
      </Button>

      <CompletionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        game={game}
        currentProgress={{
          completion: progress || 0,
          playTime: playTime || 0,
          achievements: achievementsCompleted || 0,
        }}
        onUpdateProgress={handleProgressUpdate}
      />
    </>
  );
}
