"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, Check, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Game } from "@/types/game";

interface AddToLibraryButtonProps {
  gameId: string;
  gameName: string;
  cover?: string;
  rating?: number;
  releaseDate?: number;
  platforms?: any[];
  genres?: any[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

const statusLabels: Record<GameStatus, { label: string; color: string }> = {
  playing: { label: "Currently Playing", color: "text-green-400" },
  completed: { label: "Completed", color: "text-blue-400" },
  want_to_play: { label: "Want to Play", color: "text-yellow-400" },
  dropped: { label: "Dropped", color: "text-red-400" }
};

export function AddToLibraryButton({
  gameId,
  gameName,
  cover,
  rating,
  releaseDate,
  platforms,
  genres,
  variant = 'default',
  size = 'default',
  className
}: AddToLibraryButtonProps) {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Query for game status
  const { data: currentStatus, isLoading } = useQuery<GameStatus | null>({
    queryKey: ["gameStatus", gameId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_games")
        .select("status")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return (data?.status as GameStatus) || null;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for updating game status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: GameStatus) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in to add games to your library");
      }

      // First, ensure the game exists in games table
      const gameData = {
        id: gameId,
        name: gameName,
        cover_url: cover,
        rating: rating,
        first_release_date: releaseDate,
        platforms: platforms ? JSON.stringify(platforms) : null,
        genres: genres ? JSON.stringify(genres) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert/update the game first
      const { error: gameError } = await supabase
        .from('games')
        .upsert(gameData);

      if (gameError) throw gameError;

      // Then handle the user_games table
      const { data: existingGame } = await supabase
        .from("user_games")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      let error;
      if (existingGame) {
        const { error: updateError } = await supabase
          .from("user_games")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingGame.id);
        error = updateError;
      } else {
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
      return { status, isNew: !existingGame };
    },
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueryData(["gameStatus", gameId], data.status);
      
      // Then invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["userGames"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      
      setIsOpen(false);
      toast.success(
        `${gameName} ${data.isNew ? "added to" : "updated in"} your library`,
        { duration: 3000 }
      );
    },
    onError: (error) => {
      console.error("Error updating game status:", error);
      toast.error("Failed to update game status", { duration: 4000 });
    }
  });

  // Mutation for removing from library
  const removeFromLibraryMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Optimistically update the cache
      queryClient.setQueryData(["gameStatus", gameId], null);
      
      // Then invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["userGames"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      
      setIsOpen(false);
      toast.success(`${gameName} removed from your library`, { duration: 3000 });
    },
    onError: (error) => {
      console.error("Error removing game:", error);
      toast.error("Failed to remove game", { duration: 4000 });
    }
  });

  const isPending = updateStatusMutation.isPending || removeFromLibraryMutation.isPending;

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className="min-w-[140px]">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (currentStatus) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            disabled={isPending}
            className={cn(
              "min-w-[140px] transition-all duration-200",
              isPending && "opacity-80"
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            <span className={statusLabels[currentStatus].color}>
              {statusLabels[currentStatus].label}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 ml-2 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-[200px] animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {Object.entries(statusLabels).map(([status, { label, color }]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => updateStatusMutation.mutate(status as GameStatus)}
              className={cn(
                "flex items-center py-2 transition-colors duration-150",
                currentStatus === status && "bg-accent",
                color
              )}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => removeFromLibraryMutation.mutate()}
            className="flex items-center py-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove from Library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => updateStatusMutation.mutate("want_to_play")}
      disabled={isPending}
      className={cn(
        "min-w-[140px] transition-all duration-200",
        isPending && "opacity-80",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add to Library
    </Button>
  );
}
