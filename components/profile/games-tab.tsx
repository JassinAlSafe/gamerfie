"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useEffect, useState, useMemo } from "react";
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
import { Game, GameStatus, UserGame } from "@/types/game";
import type { GameFilters } from "@/components/profile/game-filters";
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

interface GameWithUserData extends UserGame {
  game: {
    id: string;
    name: string;
    cover_url?: string;
  };
  completion_percentage?: number;
}

interface GameResponse {
  id: string;
  game_id: string;
  status: GameStatus;
  play_time: number;
  created_at: string;
  completion_percentage?: number;
  game: Game[];
}

interface GamesTabProps {
  filters: GameFilters;
}

// List View Component
const GameListItem = ({
  game,
  onDelete,
}: {
  game: GameWithUserData;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const coverUrl = game.game.cover_url
    ? getCoverImageUrl(game.game.cover_url)
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex items-center space-x-4 bg-gray-900/50 p-4 rounded-xl hover:bg-gray-800/70 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 hover:border-purple-500/20 backdrop-blur-sm cursor-pointer"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-white/5 group-hover:ring-purple-500/20 transition-all duration-300">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="80px"
            onError={(e) => {
              console.error("Image load error:", e);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-10 h-10 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-200">
          {game.game.name}
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
            {game.play_time}h
          </div>
          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
            <BarChart3 className="w-4 h-4 mr-1" />
            {game.completion_percentage || 0}%
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
              onClick={(e) => {
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
            gameName={game.game.name}
            onSuccess={() => {
              console.log(
                "Delete success in list view for game:",
                game.game_id
              );
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Grid View Component
const GameGridItem = ({
  game,
  onDelete,
}: {
  game: GameWithUserData;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const coverUrl = game.game.cover_url
    ? getCoverImageUrl(game.game.cover_url)
    : undefined;

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
              onClick={(e) => {
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
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.game.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={90}
            priority={true}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              console.error("Grid image load error:", e);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl mb-3 line-clamp-2">
              {game.game.name}
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
                {game.play_time}h
              </div>
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                {game.completion_percentage}%
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
            gameName={game.game.name}
            onSuccess={() => {
              console.log(
                "Delete success in grid view for game:",
                game.game_id
              );
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
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
  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
    <h2 className="text-2xl font-bold mb-4 text-white">No games found</h2>
    <p className="text-gray-400 mb-6">
      You haven&apos;t added any games to your library yet.
    </p>
    <Button
      onClick={() => router.push("/games")}
      className="bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
    >
      Browse Games
    </Button>
  </div>
);

export default function GamesTab({ filters }: GamesTabProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [userId, setUserId] = useState<string | null>(null);
  const { libraryView } = useSettingsStore();
  const [localGames, setLocalGames] = useState<GameWithUserData[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("user_games_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_games",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate and refetch when there are changes
          queryClient.invalidateQueries({
            queryKey: ["userGames", userId, "v2"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);

  const handleGameRemoval = (removedGameId: string) => {
    console.log("Handling game removal in UI for gameId:", removedGameId);
    setLocalGames((currentGames) => {
      const updatedGames = currentGames.filter(
        (game) => game.game_id !== removedGameId
      );
      console.log("Updated games list length:", updatedGames.length);
      return updatedGames;
    });
    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["userGames", userId, "v2"] });
  };

  const { data: games, isLoading } = useQuery<GameWithUserData[]>({
    queryKey: ["userGames", userId, "v2"],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching games for user:", userId);

      const { data, error } = await supabase
        .from("user_games")
        .select(
          `
          id,
          game_id,
          status,
          play_time,
          created_at,
          completion_percentage,
          games (
            id,
            name,
            cover_url
          )
        `
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching games:", error);
        throw error;
      }

      // Transform the response to match our interface
      const transformedData: GameWithUserData[] = data.map((item: any) => ({
        id: item.id,
        user_id: userId,
        game_id: item.game_id,
        status: item.status as GameStatus,
        play_time: item.play_time || 0,
        created_at: item.created_at,
        completion_percentage: item.completion_percentage || 0,
        game: {
          id: item.game_id,
          name: item.games.name,
          cover_url: item.games.cover_url,
        },
      }));

      console.log("Transformed games:", transformedData);
      return transformedData;
    },
    enabled: !!userId,
  });

  // Update local state when query data changes
  useEffect(() => {
    if (games) {
      setLocalGames(games);
    }
  }, [games]);

  const sortedGames = useMemo(() => {
    if (!localGames.length) return [];
    let sorted = [...localGames];

    // Apply status filter
    if (filters.status !== "all") {
      sorted = sorted.filter((game) => game.status === filters.status);
    }

    // Apply sorting
    sorted.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return filters.sortOrder === "asc"
            ? a.game.name.localeCompare(b.game.name)
            : b.game.name.localeCompare(a.game.name);
        case "recent":
        default:
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return sorted;
  }, [localGames, filters]);

  const renderGameItem = (game: GameWithUserData) => {
    if (libraryView === "list") {
      return (
        <GameListItem
          key={game.game_id}
          game={game}
          onDelete={() => handleGameRemoval(game.game_id)}
        />
      );
    }
    return (
      <GameGridItem
        key={game.game_id}
        game={game}
        onDelete={() => handleGameRemoval(game.game_id)}
      />
    );
  };

  if (isLoading) return <LoadingState />;
  if (!userId) return <EmptyState router={router} />;
  if (!localGames.length) return <EmptyState router={router} />;

  return (
    <div
      className={
        libraryView === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {sortedGames.map(renderGameItem)}
    </div>
  );
}

function getStatusColor(gameStatus: GameStatus): string {
  const colors = {
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function handleStatusChange(gameId: string, newStatus: GameStatus) {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase
    .from("user_games")
    .update({ status: newStatus })
    .eq("id", gameId);

  if (error) {
    console.error("Error updating game status:", error);
  }
}
