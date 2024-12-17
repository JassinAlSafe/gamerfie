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
import { Database } from '@/types/supabase';
import { useProgressStore } from '@/stores/useProgressStore';
import { useProfile } from '@/hooks/use-profile';

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
  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useProfile();
  const { status, loading, updateGameStatus } = useProgressStore();

  const handleStatusUpdate = async (newStatus: GameStatus) => {
    if (!profile?.id) {
      toast.error('Please sign in to add games to your library');
      return;
    }
    
    const gameData = {
      id: gameId,
      name: gameName,
      cover_url: cover,
      rating: rating,
      first_release_date: releaseDate,
      platforms: platforms,
      genres: genres,
    };
    
    await updateGameStatus(profile.id, gameId, newStatus, gameData);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled className="min-w-[140px]">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (status) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            disabled={loading}
            className={cn(
              "min-w-[140px] transition-all duration-200",
              loading && "opacity-80"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            <span className={statusLabels[status].color}>
              {statusLabels[status].label}
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
          {Object.entries(statusLabels).map(([statusKey, { label, color }]) => (
            <DropdownMenuItem
              key={statusKey}
              onClick={() => handleStatusUpdate(statusKey as GameStatus)}
              className={cn(
                "flex items-center py-2 transition-colors duration-150",
                status === statusKey && "bg-accent",
                color
              )}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusUpdate('dropped')}
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
      onClick={() => handleStatusUpdate('want_to_play')}
      disabled={loading}
      className={cn(
        "min-w-[140px] transition-all duration-200",
        loading && "opacity-80",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add to Library
    </Button>
  );
}
