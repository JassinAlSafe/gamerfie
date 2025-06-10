"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/stores/useProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { checkGameInLibrary } from "@/utils/game-utils";
import { CompletionDialog } from "@/components/game/dialogs/CompletionDialog";
import { toast } from "sonner";
import { Game } from "@/types/game";
import { Loader2, Trophy, Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameProgress {
  playTime?: number;
  completionPercentage?: number;
  achievementsCompleted?: number;
}

interface UpdateProgressButtonProps {
  gameId: string;
  gameName: string;
  game: Game;
  progress?: Partial<GameProgress>;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  onSuccess?: () => void;
}

export function UpdateProgressButton({
  gameId,
  gameName,
  size = "default",
  className,
  onSuccess,
}: UpdateProgressButtonProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user } = useAuthStore();
  const {
    updateProgress,
    updateGameStatus,
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

  // const handleDialogOpenChange = useCallback((open: boolean) => {
  //   setDialogOpen(open);
  // }, []);

  const handleProgressUpdate = useCallback(
    async (progress: Partial<GameProgress>) => {
      if (!user) {
        toast.error("Please sign in to update progress");
        return;
      }

      const updateData = {
        play_time: progress.playTime ?? (play_time || 0),
        completion_percentage: progress.completionPercentage ?? (completion_percentage || 0),
        achievements_completed: progress.achievementsCompleted ?? (achievements_completed || 0),
      };

      console.log("UpdateProgressButton: Updating progress with data:", updateData);
      
      try {
        // First update the progress
        await updateProgress(user.id, gameId, updateData);
        
        // Determine the appropriate status based on progress
        let newStatus: "playing" | "completed" | "want_to_play" = "playing";
        
        if (updateData.completion_percentage >= 100) {
          newStatus = "completed";
        } else if (updateData.play_time > 0 || updateData.completion_percentage > 0) {
          newStatus = "playing";
        } else {
          newStatus = "want_to_play";
        }

        // Check if game is already in library and get current status
        const libraryEntry = await checkGameInLibrary(gameId, user.id);
        
        // Only update status if it needs to change or if game isn't in library yet
        if (!libraryEntry || libraryEntry.status !== newStatus) {
          console.log(`UpdateProgressButton: Updating status to ${newStatus}`);
          await updateGameStatus(user.id, gameId, newStatus);
        }

        console.log("UpdateProgressButton: Progress update successful");
        toast.success(`Progress updated! Game status: ${newStatus === 'want_to_play' ? 'Want to Play' : newStatus === 'playing' ? 'Currently Playing' : 'Completed'}`);
        setDialogOpen(false);
        
        // Refetch progress to ensure UI is updated
        await fetchProgress(user.id, gameId);
        
        // Trigger parent component refresh
        onSuccess?.();
      } catch (error) {
        console.error("UpdateProgressButton: Error updating progress:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update progress"
        );
      }
    },
    [user, play_time, completion_percentage, achievements_completed, updateProgress, updateGameStatus, gameId, fetchProgress, onSuccess]
  );

  const progressText = useMemo(() => {
    // Show comprehensive progress if both available
    if (play_time && play_time > 0 && completion_percentage && completion_percentage > 0) {
      return `${completion_percentage}% • ${play_time}h`;
    }
    
    // Show play time if available
    if (play_time && play_time > 0) {
      return `${play_time}h played`;
    }
    
    // Show completion percentage if available
    if (completion_percentage && completion_percentage > 0) {
      return `${completion_percentage}% Complete`;
    }
    
    // Default text
    return "Track Progress";
  }, [completion_percentage, play_time]);

  // Determine button variant based on progress state
  const buttonVariant = useMemo(() => {
    if (completion_percentage && completion_percentage >= 100) {
      return "default"; // Completed games get primary styling
    }
    if (play_time && play_time > 0) {
      return "secondary"; // Games with playtime get secondary styling
    }
    return "outline"; // New games get outline styling
  }, [completion_percentage, play_time]);

  // Determine button color scheme
  const buttonColorClass = useMemo(() => {
    if (completion_percentage && completion_percentage >= 100) {
      return "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700";
    }
    if (play_time && play_time > 0) {
      return "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700";
    }
    return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700";
  }, [completion_percentage, play_time]);

  // Determine icon based on progress state
  const progressIcon = useMemo(() => {
    if (completion_percentage && completion_percentage >= 100) {
      return <Trophy className="w-4 h-4 mr-2" />;
    }
    if (play_time && play_time > 0) {
      return <Play className="w-4 h-4 mr-2" />;
    }
    return <Plus className="w-4 h-4 mr-2" />;
  }, [completion_percentage, play_time]);

  // const currentProgress = useMemo(
  //   () => ({
  //     play_time: play_time ?? 0,
  //     completion_percentage: completion_percentage ?? 0,
  //     achievements_completed: achievements_completed ?? 0,
  //   }),
  //   [play_time, completion_percentage, achievements_completed]
  // );

  return (
    <>
      <Button
        variant={buttonVariant}
        size={size}
        onClick={() => setDialogOpen(true)}
        disabled={loading}
        className={cn(
          "min-w-[140px] h-10 transition-all duration-200 font-medium",
          buttonColorClass,
          "border-none text-white shadow-md hover:shadow-lg",
          "relative overflow-hidden group",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          progressIcon
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
