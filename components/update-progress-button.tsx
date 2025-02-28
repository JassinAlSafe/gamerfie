"use client";

import React, { useCallback, useMemo } from "react";
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
  progress?: Partial<GameProgress>;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UpdateProgressButton({
  gameId,
  gameName,
  game,
  progress,
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

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
  }, []);

  const handleProgressUpdate = useCallback(
    async (progress: Partial<GameProgress>) => {
      if (!user) {
        toast.error("Please sign in to update progress");
        return;
      }

      const updateData: Partial<GameProgress> = {
        playTime: progress.playTime ?? (play_time || 0),
        completionPercentage:
          progress.completionPercentage ?? (completion_percentage || 0),
      };

      if (typeof progress.achievementsCompleted === "number") {
        updateData.achievementsCompleted = progress.achievementsCompleted;
      }

      try {
        await updateProgress(user.id, gameId, updateData as any);
        toast.success("Progress updated successfully!");
        setDialogOpen(false);
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update progress"
        );
      }
    },
    [user, play_time, completion_percentage, updateProgress, gameId]
  );

  const progressText = useMemo(
    () =>
      completion_percentage
        ? `${completion_percentage}% Complete`
        : "Update Progress",
    [completion_percentage]
  );

  const currentProgress = useMemo(
    () => ({
      play_time: play_time ?? 0,
      completion_percentage: completion_percentage ?? 0,
      achievements_completed: achievements_completed ?? 0,
    }),
    [play_time, completion_percentage, achievements_completed]
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        disabled={loading}
        className={cn(
          "min-w-[140px] h-10 transition-all duration-200 font-medium",
          "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
          "border-none text-white shadow-md hover:shadow-lg",
          "relative overflow-hidden group",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <BarChart2 className="w-4 h-4 mr-2" />
        )}
        <span className="relative z-10">{progressText}</span>
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      <CompletionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        game={
          {
            id: gameId,
            name: gameName || "",
          } as Game
        }
        progress={{
          completionPercentage: completion_percentage || 0,
          playTime: play_time || 0,
          achievementsCompleted: achievements_completed || 0,
        }}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
}
