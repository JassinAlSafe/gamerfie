"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/stores/useProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { CompletionDialog } from "@/components/game/dialogs/CompletionDialog";
import { toast } from "sonner";
import { Game, GameProgress } from "@/types/game";
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
    updateProgress,
    loading,
    play_time,
    completion_percentage,
    achievements_completed,
    fetchProgress,
  } = useProgressStore();

  React.useEffect(() => {
    if (user && gameId) {
      fetchProgress(user.id, gameId);
    }
  }, [user, gameId, fetchProgress]);

  const handleProgressUpdate = async (progress: Partial<GameProgress>) => {
    if (!user) {
      toast.error("Please sign in to update progress");
      return;
    }

    const updateData: Partial<GameProgress> = {
      play_time: progress.play_time ?? play_time,
      completion_percentage:
        progress.completion_percentage ?? completion_percentage,
    };

    if (typeof progress.achievements_completed === "number") {
      updateData.achievements_completed = progress.achievements_completed;
    }

    try {
      await updateProgress(user.id, gameId, updateData);
      toast.success("Progress updated successfully!");
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update progress"
      );
    }
  };

  const progressText = completion_percentage
    ? `${completion_percentage}% Complete`
    : "Update Progress";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        disabled={loading}
        className={cn(
          "min-w-[140px] transition-all duration-200",
          "bg-purple-600 hover:bg-purple-700 text-white",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <BarChart2 className="w-4 h-4 mr-2" />
        )}
        {progressText}
      </Button>

      <CompletionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProgressUpdate={handleProgressUpdate}
        game={game}
        progress={{
          play_time: play_time ?? 0,
          completion_percentage: completion_percentage ?? 0,
          achievements_completed: achievements_completed ?? 0,
        }}
      />
    </>
  );
}
