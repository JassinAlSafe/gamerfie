"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gamepad2, Clock, BarChart3, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { Game, GameStatus, ProcessedGame, UserGame } from "@/types/game";

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

export function GamesTab() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [userId, setUserId] = useState<string | null>(null);
  const { profile } = useProfile();
  const viewStyle = profile?.settings?.library?.view || "grid";

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
    console.log("Sorting games:", games);
    return [...games].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [games]);

  if (!userId) {
    console.log("No user ID found");
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to view your games</h2>
        <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
      </div>
    );
  }

  if (isLoading) {
    console.log("Loading games...");
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!games?.length) {
    console.log("No games found");
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No games found</h2>
        <p className="text-gray-400 mb-4">
          You haven&apos;t added any games to your library yet.
        </p>
        <Button onClick={() => router.push("/games")}>Browse Games</Button>
      </div>
    );
  }

  console.log("Rendering games:", sortedGames);
  console.log("View style:", viewStyle);

  if (viewStyle === "list") {
    return (
      <div className="space-y-4">
        {sortedGames.map((game) => {
          console.log("Rendering game:", game);
          const imageUrl = game.game.cover_url;
          console.log("Image URL:", imageUrl);
          return (
            <motion.div
              key={game.game_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="relative w-16 h-20 overflow-hidden rounded-md">
                {game.game.cover_url ? (
                  <Image
                    src={imageUrl || ""}
                    alt={game.game.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error("Image load error:", e);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-700">
                    <Gamepad2 className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-white font-semibold">{game.game.name}</h3>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        game.status
                      )}`}
                    />
                    <span className="text-sm text-gray-400">
                      {formatStatus(game.status)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {game.play_time}h
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {game.completion_percentage}%
                  </div>
                </div>
              </div>
              <StatusDropdown
                status={game.status}
                onStatusChange={(newStatus) =>
                  handleStatusChange(game.game_id, newStatus)
                }
              />
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedGames.map((game) => {
        const imageUrl = game.game.cover_url;
        console.log("Grid image URL:", imageUrl);
        return (
          <motion.div
            key={game.game_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative cursor-pointer rounded-xl overflow-hidden"
          >
            <div className="aspect-[3/4] bg-gray-800/80 relative">
              {game.game.cover_url ? (
                <Image
                  src={imageUrl || ""}
                  alt={game.game.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error("Grid image load error:", e);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-700">
                  <Gamepad2 className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-2">
                    {game.game.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                          game.status
                        )}`}
                      />
                      <p className="text-gray-200 text-sm">
                        {formatStatus(game.status)}
                      </p>
                    </div>
                    <StatusDropdown
                      status={game.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(game.game_id, newStatus)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {game.play_time}h
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {game.completion_percentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatusDropdown({
  status,
  onStatusChange,
}: {
  status: GameStatus;
  onStatusChange: (status: GameStatus) => void;
}) {
  const statusOptions = [
    {
      value: "want_to_play" as GameStatus,
      label: "Want to Play",
      color: "text-yellow-400",
    },
    {
      value: "playing" as GameStatus,
      label: "Playing",
      color: "text-green-400",
    },
    {
      value: "completed" as GameStatus,
      label: "Completed",
      color: "text-blue-400",
    },
    { value: "dropped" as GameStatus, label: "Dropped", color: "text-red-400" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`${status === option.value ? "bg-gray-800" : ""} ${
              option.color
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getStatusColor(status: GameStatus): string {
  const colors = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500",
  };
  return colors[status as keyof typeof colors] || "bg-gray-500";
}

function formatStatus(status: GameStatus): string {
  return status
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
