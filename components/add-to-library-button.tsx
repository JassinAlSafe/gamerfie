"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Check, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

interface AddToLibraryButtonProps {
  gameId: string;
  gameName: string;
}

type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

const statusLabels: Record<GameStatus, string> = {
  playing: "Currently Playing",
  completed: "Completed",
  want_to_play: "Want to Play",
  dropped: "Dropped",
};

export function AddToLibraryButton({
  gameId,
  gameName,
}: AddToLibraryButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<GameStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkGameStatus();
  }, [gameId]);

  const checkGameStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_games")
        .select("status")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setCurrentStatus((data?.status as GameStatus) || null);
    } catch (error) {
      console.error("Error checking game status:", error);
      toast.error("Failed to check game status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameStatus = async (status: GameStatus) => {
    try {
      setIsUpdating(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to add games to your library");
        return;
      }

      // First, check if the game exists
      const { data: existingGame } = await supabase
        .from("user_games")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      let error;
      if (existingGame) {
        // Update existing game
        const { error: updateError } = await supabase
          .from("user_games")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingGame.id);
        error = updateError;
      } else {
        // Insert new game
        const { error: insertError } = await supabase
          .from("user_games")
          .insert({
            user_id: user.id,
            game_id: gameId,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        error = insertError;
      }

      if (error) throw error;

      setCurrentStatus(status);
      toast.success(
        `${gameName} ${existingGame ? "updated in" : "added to"} your library`
      );
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.error("Failed to update game status");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromLibrary = async () => {
    try {
      setIsUpdating(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;

      setCurrentStatus(null);
      toast.success(`${gameName} removed from your library`);
    } catch (error) {
      console.error("Error removing game:", error);
      toast.error("Failed to remove game");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking status...
      </Button>
    );
  }

  if (currentStatus) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full md:w-auto" disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {statusLabels[currentStatus]}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(statusLabels).map(([status, label]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => updateGameStatus(status as GameStatus)}
              className={currentStatus === status ? "bg-accent" : ""}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="text-destructive"
            onClick={removeFromLibrary}
          >
            Remove from Library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => updateGameStatus("want_to_play")}
      disabled={isUpdating}
      className="w-full md:w-auto"
    >
      {isUpdating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add to Library
    </Button>
  );
}
