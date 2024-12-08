"use client";

import { useState, useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { fetchUserGames, updateGameStatus } from "@/utils/game-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gamepad2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface GamesGridProps {
  userId: string;
}

const GAMES_PER_PAGE = 24;

export function GamesTab({ userId }: GamesGridProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, [supabase]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["userGames", userId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const result = await fetchUserGames({
          supabase, // Pass supabase client here
          start: pageParam * GAMES_PER_PAGE,
          end: (pageParam + 1) * GAMES_PER_PAGE - 1,
          userId,
        });
        return result;
      } catch (error) {
        console.error("Error fetching user games:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.hasMore) {
        return pages.length;
      }
      return undefined;
    },
    retry: (failureCount, error: any) => {
      if (error?.message === "No authenticated user") {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: any) => {
      console.error("Query error:", error);
      if (error?.message === "No authenticated user") {
        router.push("/signin");
      }
    },
    cacheTime: 0,
    staleTime: 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { gameId: string; newStatus: string }) =>
      updateGameStatus(supabase, variables.gameId, variables.newStatus, userId),
    onMutate: async (newGame) => {
      await queryClient.cancelQueries(["userGames", userId]);

      const previousUserGames = queryClient.getQueryData(["userGames", userId]);
      const previousStats = queryClient.getQueryData(["userStats", userId]) as GameStats | undefined;

      // Find the previous status of the game
      let previousStatus = "";
      if (previousUserGames) {
        previousUserGames.pages.forEach((page: any) => {
          page.userGames.forEach((game: any) => {
            if (game.game_id === newGame.gameId) {
              previousStatus = game.status;
            }
          });
        });
      }

      // Optimistically update the game status in the cache
      queryClient.setQueryData(["userGames", userId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            userGames: page.userGames.map((game: any) =>
              game.game_id === newGame.gameId
                ? { ...game, status: newGame.newStatus }
                : game
            ),
          })),
        };
      });

      // Optimistically update the stats in the cache
      if (previousStats && previousStatus) {
        const decrementField = getStatusField(previousStatus);
        const incrementField = getStatusField(newGame.newStatus);

        queryClient.setQueryData(["userStats", userId], {
          ...previousStats,
          [decrementField]: previousStats[decrementField] - 1,
          [incrementField]: previousStats[incrementField] + 1,
        });
      }

      return { previousUserGames, previousStats, previousStatus };
    },
    onError: (err, newGame, context) => {
      if (context?.previousUserGames) {
        queryClient.setQueryData(["userGames", userId], context.previousUserGames);
      }
      if (context?.previousStats && context.previousStatus) {
        const decrementField = getStatusField(newGame.newStatus);
        const incrementField = getStatusField(context.previousStatus);

        queryClient.setQueryData(["userStats", userId], {
          ...context.previousStats,
          [decrementField]: context.previousStats[decrementField] - 1,
          [incrementField]: context.previousStats[incrementField] + 1,
        });
      }
      console.error("Error updating game status:", err);
      toast.error("Failed to update game status. Please try again.");
    },
    onSuccess: () => {
      toast.success("Game status updated successfully.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["userGames", userId]);
      // Optionally invalidate stats to sync with server
      // queryClient.invalidateQueries(["userStats", userId]);
    },
  });

  if (!isAuthenticated) {
    router.push("/signin");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
        <p className="text-xl font-semibold text-gray-300">
          Loading your game collection...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error loading games</h2>
        <p className="text-center max-w-md">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button
          onClick={() => router.refresh()}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const games = data?.pages.flatMap((page) => page.userGames) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "playing":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "want_to_play":
        return "bg-yellow-500";
      case "dropped":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl">
              {game.cover ? (
                <Image
                  src={game.cover.url.replace("t_thumb", "t_cover_big")}
                  alt={game.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-700">
                  <Gamepad2 className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm sm:text-base truncate mb-1">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          game.status
                        )}`}
                      ></span>
                      <p className="text-gray-300 text-xs sm:text-sm">
                        {formatStatus(game.status)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4 text-gray-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({
                              gameId: game.game_id,
                              newStatus: "want_to_play",
                            })
                          }
                        >
                          Want to Play
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({
                              gameId: game.game_id,
                              newStatus: "playing",
                            })
                          }
                        >
                          Playing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({
                              gameId: game.game_id,
                              newStatus: "completed",
                            })
                          }
                        >
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({
                              gameId: game.game_id,
                              newStatus: "dropped",
                            })
                          }
                        >
                          Dropped
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {hasNextPage && (
        <div className="text-center mt-12">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            size="lg"
            className="bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 shadow-lg"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Games"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to map status to stat fields
function getStatusField(status: string) {
  switch (status) {
    case "playing":
      return "currentlyPlaying";
    case "completed":
      return "completedGames";
    case "want_to_play":
      return "backlog";
    case "dropped":
      return "droppedGames";
    default:
      return "";
  }
}
