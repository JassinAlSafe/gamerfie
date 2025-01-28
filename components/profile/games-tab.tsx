"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gamepad2, Clock, BarChart3 } from "lucide-react";
import { Game, GameStatus, UserGame } from "@/types/game";
import type { GameFilters } from "@/components/profile/game-filters";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCoverImageUrl } from "@/utils/image-utils";
import { GameStatusDropdown } from "@/components/game/game-status-dropdown";

interface GameWithUserData extends UserGame {
  game: Game;
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
const GameListItem = ({ game }: { game: GameWithUserData }) => {
  const router = useRouter();

  const coverUrl = game.game.cover_url
    ? getCoverImageUrl(game.game.cover_url)
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center space-x-4 bg-gray-900/50 p-4 rounded-xl hover:bg-gray-800/70 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 hover:border-purple-500/20 backdrop-blur-sm cursor-pointer"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-white/5 group-hover:ring-purple-500/20 transition-all duration-300">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            {game.completion_percentage}%
          </div>
        </div>
      </div>
      <GameStatusDropdown
        status={game.status}
        gameId={game.game_id}
        onStatusChange={(newStatus) =>
          handleStatusChange(game.game_id, newStatus)
        }
      />
    </motion.div>
  );
};

// Grid View Component
const GameGridItem = ({ game }: { game: GameWithUserData }) => {
  const router = useRouter();
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

export function GamesTab({ filters }: GamesTabProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [userId, setUserId] = useState<string | null>(null);
  const { libraryView } = useSettingsStore();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session:", session);
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  const { data: games, isLoading } = useQuery<GameWithUserData[]>({
    queryKey: ["userGames", userId, "v2"],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Fetching games for user:", userId);

      // First, let's check what we get from a simpler query
      const testQuery = await supabase
        .from("user_games")
        .select("*, games(*)")
        .eq("user_id", userId)
        .limit(1);
      console.log("Test query result:", testQuery);
      console.log("Test query data structure:", testQuery.data?.[0]);

      // Now try the full query with the correct field names
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
          game:games(
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

      console.log("Raw data from Supabase:", data);

      // Transform the response to match our Game interface
      const transformedData = (data as GameResponse[]).map((item) => {
        const game = item.game[0] || null;
        console.log("Processing game:", game);
        if (!game) return item;

        return {
          user_id: userId,
          game_id: item.game_id,
          status: item.status as GameStatus,
          play_time: item.play_time,
          created_at: item.created_at,
          game: {
            id: game.id,
            name: game.name,
            cover_url: game.cover_url,
          },
        };
      }) as GameWithUserData[];

      console.log("Transformed games:", transformedData);
      return transformedData;
    },
    enabled: !!userId,
  });

  const sortedGames = useMemo(() => {
    if (!games) return [];

    let sorted = [...games];

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
        case "rating":
          const ratingA = a.game.total_rating || 0;
          const ratingB = b.game.total_rating || 0;
          return filters.sortOrder === "asc"
            ? ratingA - ratingB
            : ratingB - ratingA;
        case "recent":
        default:
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return sorted;
  }, [games, filters]);

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/50 rounded-xl border border-white/10 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Sign in to view your games
        </h2>
        <Button
          onClick={() => router.push("/auth/signin")}
          className="bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!games?.length) {
    return <EmptyState router={router} />;
  }

  if (libraryView === "list") {
    return (
      <div className="space-y-4">
        {sortedGames.map((game) => (
          <GameListItem key={game.game_id} game={game} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedGames.map((game) => (
        <GameGridItem key={game.game_id} game={game} />
      ))}
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
