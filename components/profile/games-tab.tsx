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

// Define types locally to fix import errors
type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

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
  games: any; // This should match your data structure
}

interface GamesTabProps {
  filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
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

  const coverUrl = game.games.cover_url
    ? getCoverImageUrl(game.games.cover_url)
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
            alt={game.games.name}
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
              onClick={(_e) => {
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
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => {
    console.log("GameGridItem - Raw game data:", game);

    // Get the cover URL from the games table
    const rawCoverUrl = game.games?.cover_url;
    console.log("GameGridItem - Raw cover URL:", rawCoverUrl);

    if (!rawCoverUrl) {
      console.log("GameGridItem - No cover URL found");
      return undefined;
    }

    // Process the URL through our utility function
    const processed = getCoverImageUrl(rawCoverUrl);
    console.log("GameGridItem - Processed URL:", processed);
    return processed;
  }, [game]);

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
              onClick={(_e) => {
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
            onError={(e) => {
              console.error(
                "Failed to load image:",
                coverUrl,
                "for game:",
                game.games.name,
                "Error:",
                e
              );
              setImageError(true);
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
          *,
          games (
            id,
            name,
            cover_url,
            platforms,
            genres,
            summary,
            created_at,
            updated_at
          )
        `
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching games:", error);
        throw error;
      }

      console.log("Raw data from Supabase:", data);

      // Transform the response to match our interface
      const mappedGames = data.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        game_id: item.game_id,
        status: item.status as GameStatus,
        playTime: item.play_time || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completionPercentage: item.completion_percentage || 0,
        achievementsCompleted: item.achievements_completed || 0,
        userRating: item.user_rating,
        notes: item.notes,
        lastPlayedAt: item.last_played_at,
        coverUrl: item.cover_url,
        games: item.games,
      }));

      console.log("Final transformed data:", mappedGames);
      return mappedGames;
    },
    enabled: !!userId,
  });

  // Update local state when query data changes
  useEffect(() => {
    if (games) {
      console.log("Setting local games state:", games);
      setLocalGames(games);
    }
  }, [games]);

  const sortedGames = useMemo(() => {
    if (!localGames.length) return [];
    console.log("Sorting games from local state:", localGames);
    let sorted = [...localGames];

    // Apply status filter
    if (filters.status !== "all") {
      sorted = sorted.filter((game) => game.status === filters.status);
      console.log("After status filter:", sorted);
    }

    // Apply sorting
    sorted.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return filters.sortOrder === "asc"
            ? a.games.name.localeCompare(b.games.name)
            : b.games.name.localeCompare(a.games.name);
        case "recent":
        default:
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    console.log("Final sorted games:", sorted);
    return sorted;
  }, [localGames, filters]);

  const renderGameItem = (game: GameWithUserData) => {
    console.log("Rendering game item:", game);
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
