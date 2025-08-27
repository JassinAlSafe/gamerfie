"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Clock,
  BarChart3,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCoverImageUrl } from "@/utils/image-utils";
import { GameStatusDropdown } from "@/components/game/game-status-dropdown";
import { DeleteFromLibraryButton } from "../delete-from-library-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import proper types from the types file
import type { GameStatus } from "@/types";

// Database game data structure from joined query
interface DatabaseGameData {
  id: string;
  name: string;
  cover_url?: string | null;
}

// Component interfaces - keeping this focused on what components actually need

// Extended interface for component usage
interface GameWithUserData {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  playTime: number;
  created_at: string;
  updated_at: string;
  completionPercentage: number;
  achievementsCompleted: number;
  userRating?: number;
  notes?: string;
  lastPlayedAt?: string;
  coverUrl?: string;
  games: DatabaseGameData;
}

interface GamesTabProps {
  filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    platform?: string;
    genre?: string;
  };
}

// List View Component
const GameListItem = React.memo(({
  game,
  onDelete,
  handleStatusChange,
}: {
  game: GameWithUserData;
  onDelete: () => void;
  handleStatusChange: (gameId: string, newStatus: GameStatus) => Promise<void>;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => {
    return game.games.cover_url
      ? getCoverImageUrl(game.games.cover_url)
      : undefined;
  }, [game.games.cover_url]); // Memoize the cover URL calculation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex items-center space-x-4 bg-gray-900/50 p-4 rounded-xl hover:bg-gray-800/70 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 hover:border-purple-500/20 backdrop-blur-sm cursor-pointer"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-white/5 group-hover:ring-purple-500/20 transition-all duration-300">
        {!imageError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.games.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-10 h-10 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-200">
          {game.games.name}
        </h3>
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(game.status)}`}
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
              {formatStatus(game.status)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
            <Clock className="w-4 h-4 mr-1" />
            {game.playTime}h
          </div>
          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
            <BarChart3 className="w-4 h-4 mr-1" />
            {game.completionPercentage || 0}%
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <GameStatusDropdown
          status={game.status}
          gameId={game.game_id}
          onStatusChange={(newStatus) =>
            handleStatusChange(game.game_id, newStatus)
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => {
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {showDeleteDialog && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl"
        >
          <DeleteFromLibraryButton
            gameId={game.game_id}
            gameName={game.games.name}
            onSuccess={() => {
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

GameListItem.displayName = 'GameListItem';

// Grid View Component
const GameGridItem = React.memo(({
  game,
  onDelete,
  handleStatusChange,
}: {
  game: GameWithUserData;
  onDelete: () => void;
  handleStatusChange: (gameId: string, newStatus: GameStatus) => Promise<void>;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => {
    // Get the cover URL from the games table
    const rawCoverUrl = game.games?.cover_url;

    if (!rawCoverUrl) {
      return undefined;
    }

    // Process the URL through our utility function
    return getCoverImageUrl(rawCoverUrl);
  }, [game.games?.cover_url]); // Optimal dependency - only re-compute when URL changes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-purple-500/20 backdrop-blur-sm"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-zinc-900/80 hover:bg-zinc-900"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => {
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="aspect-[3/4] bg-gray-900/80 relative">
        {!imageError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.games.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={100}
            priority={false}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl mb-3 line-clamp-2">
              {game.games.name}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                    game.status
                  )}`}
                />
                <p className="text-gray-200 text-sm font-medium">
                  {formatStatus(game.status)}
                </p>
              </div>
              <GameStatusDropdown
                status={game.status}
                gameId={game.game_id}
                onStatusChange={(newStatus) =>
                  handleStatusChange(game.game_id, newStatus)
                }
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <Clock className="w-4 h-4 mr-1.5" />
                {game.playTime}h
              </div>
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                {game.completionPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteDialog && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <DeleteFromLibraryButton
            gameId={game.game_id}
            gameName={game.games.name}
            onSuccess={() => {
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

GameGridItem.displayName = 'GameGridItem';

// Loading State Component
const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="aspect-[3/4] bg-gray-900/50 rounded-xl animate-pulse overflow-hidden border border-white/5"
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50" />
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ router }: { router: ReturnType<typeof useRouter> }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-16 text-center bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl border border-purple-500/20 backdrop-blur-sm"
  >
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center">
        <Gamepad2 className="w-12 h-12 text-purple-400" />
      </div>
    </div>
    <h2 className="text-3xl font-bold mb-4 text-white">Your Game Library is Empty</h2>
    <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
      Start building your gaming collection! Browse our catalog to discover new games and track your gaming journey.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={() => router.push("/games")}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
      >
        <Gamepad2 className="w-4 h-4 mr-2" />
        Browse Games
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/games/search")}
        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
      >
        Search Games
      </Button>
    </div>
  </motion.div>
);

export default function GamesTab({ filters }: GamesTabProps) {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { libraryView } = useSettingsStore();
  const queryClient = useQueryClient();
  
  // Create the status change handler with proper dependencies
  const handleStatusChange = useMemo(
    () => createHandleStatusChange(queryClient, userId),
    [queryClient, userId]
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  // Subscribe to realtime changes with optimized filtering and debouncing
  useEffect(() => {
    if (!userId) return;

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true; // Guard against late updates
    
    const debouncedInvalidate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Only invalidate if component is still mounted and subscription is active
        if (isSubscribed) {
          queryClient.invalidateQueries({
            queryKey: ["userGames", userId, "v2"],
          });
        }
      }, 500); // 500ms debounce to prevent excessive refetches
    };

    const channel = supabase
      .channel(`user_games_${userId}`) // User-specific channel name
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_games",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Early return if component unmounted
          if (!isSubscribed) return;
          
          // Type-safe payload handling
          interface UserGamePayload {
            user_id?: string;
            id?: string;
            game_id?: string;
            status?: string;
            play_time?: number | null;
            completion_percentage?: number | null;
            achievements_completed?: number | null;
            user_rating?: number | null;
            notes?: string | null;
            last_played_at?: string | null;
            created_at?: string;
            updated_at?: string;
          }
          
          const newRecord = payload.new as UserGamePayload | null;
          const oldRecord = payload.old as UserGamePayload | null;
          
          // Only invalidate if the change affects this user's data
          if (newRecord?.user_id === userId || oldRecord?.user_id === userId) {
            debouncedInvalidate();
          }
        }
      )
      .subscribe();

    // Cleanup function with proper order
    return () => {
      isSubscribed = false; // Prevent any late updates
      clearTimeout(debounceTimer); // Clear pending debounce timer
      supabase.removeChannel(channel); // Remove subscription
    };
  }, [userId, queryClient, supabase]);

  const handleGameRemoval = useCallback(() => {
    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["userGames", userId, "v2"] });
  }, [queryClient, userId]);

  const { data: games, isLoading } = useQuery<GameWithUserData[]>({
    queryKey: ["userGames", userId, "v2"],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_games")
        .select(
          `
          id,
          user_id,
          game_id,
          status,
          play_time,
          created_at,
          updated_at,
          completion_percentage,
          achievements_completed,
          user_rating,
          notes,
          last_played_at,
          games (
            id,
            name,
            cover_url
          )
        `
        )
        .eq("user_id", userId)
        .order("last_played_at", { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(`Failed to fetch games: ${error.message}`);
      }

      // Transform the response to match our interface with proper type safety
      const mappedGames: GameWithUserData[] = (data ?? []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        game_id: item.game_id,
        status: item.status as GameStatus,
        playTime: item.play_time || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completionPercentage: item.completion_percentage || 0,
        achievementsCompleted: item.achievements_completed || 0,
        userRating: item.user_rating || undefined,
        notes: item.notes || undefined,
        lastPlayedAt: item.last_played_at || undefined,
        games: item.games,
      }));

      return mappedGames;
    },
    enabled: !!userId,
  });

  const sortedGames = useMemo(() => {
    if (!games?.length) return [];
    
    let filtered = [...games];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((game) => game.status === filters.status);
    }

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter((game) => 
        game.games?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply platform filter - type-safe access to extended data
    if (filters.platform && filters.platform !== "all") {
      filtered = filtered.filter(() => {
        // Since platforms aren't in our current database schema, skip platform filtering for now
        // This would require extending the games table or fetching from IGDB
        return true;
      });
    }

    // Apply genre filter - type-safe access to extended data  
    if (filters.genre && filters.genre !== "all") {
      filtered = filtered.filter(() => {
        // Since genres aren't in our current database schema, skip genre filtering for now
        // This would require extending the games table or fetching from IGDB
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          const nameA = a.games?.name || "";
          const nameB = b.games?.name || "";
          return filters.sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        case "playtime":
          const timeA = a.playTime || 0;
          const timeB = b.playTime || 0;
          return filters.sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        case "rating":
          const ratingA = a.userRating || 0;
          const ratingB = b.userRating || 0;
          return filters.sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
        case "recent":
        default:
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return filtered;
  }, [games, filters]);

  const renderGameItem = useCallback((game: GameWithUserData) => {
    if (libraryView === "list") {
      return (
        <GameListItem
          key={game.game_id}
          game={game}
          onDelete={handleGameRemoval}
          handleStatusChange={handleStatusChange}
        />
      );
    }
    return (
      <GameGridItem
        key={game.game_id}
        game={game}
        onDelete={handleGameRemoval}
        handleStatusChange={handleStatusChange}
      />
    );
  }, [libraryView, handleGameRemoval, handleStatusChange]); // Memoize render function

  if (isLoading) return <LoadingState />;
  if (!userId) return <EmptyState router={router} />;
  if (!games?.length) return <EmptyState router={router} />;

  return (
    <div
      className={
        libraryView === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4"
          : "space-y-2 sm:space-y-3"
      }
    >
      {sortedGames.map(renderGameItem)}
    </div>
  );
}

function getStatusColor(gameStatus: GameStatus): string {
  const colors: Record<GameStatus, string> = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500",
  };
  return colors[gameStatus] || "bg-gray-500";
}

function formatStatus(gameStatus: GameStatus): string {
  return gameStatus
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Type-safe status change handler factory
const createHandleStatusChange = (
  queryClient: ReturnType<typeof useQueryClient>, 
  userId: string | null
) => {
  return async (gameId: string, newStatus: GameStatus) => {
    if (!userId) {
      console.error('Cannot update game status: User not authenticated');
      throw new Error('User not authenticated');
    }

    const supabase = createClient();

    try {
      // Optimistic update - update cache first for better UX
      queryClient.setQueryData(
        ["userGames", userId, "v2"],
        (oldData: GameWithUserData[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(game => 
            game.game_id === gameId 
              ? { ...game, status: newStatus }
              : game
          );
        }
      );

      const { error } = await supabase
        .from("user_games")
        .update({ status: newStatus })
        .eq("game_id", gameId)
        .eq("user_id", userId);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({
          queryKey: ["userGames", userId, "v2"],
        });
        console.error("Failed to update game status:", error);
        throw new Error(`Failed to update game status: ${error.message}`);
      }

      // If successful, refresh data to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["userGames", userId, "v2"],
      });

    } catch (error) {
      console.error("Error updating game status:", error);
      
      // Revert optimistic update on any error
      queryClient.invalidateQueries({
        queryKey: ["userGames", userId, "v2"],
      });
      
      // Re-throw for component-level error handling
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  };
};
