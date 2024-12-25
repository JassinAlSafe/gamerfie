"use client";

import { GameCard } from "@/components/game-card";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import LoadingSpinner from "@/components/loadingSpinner";
import { GameStatus } from "@/types/game";
import { useGamesStore } from "@/stores/useGamesStore";

interface GamesTabProps {
  userId: string;
  filters: {
    status: string;
    sortBy: string;
    sortOrder: string;
    view: "grid" | "list";
  };
}

export function GamesTab({ userId, filters }: GamesTabProps) {
  const router = useRouter();
  const {
    userGames: games,
    userGamesLoading: isLoading,
    userGamesError: error,
    fetchUserGames,
    updateGameStatus,
    resetUserGames,
  } = useGamesStore();

  useEffect(() => {
    fetchUserGames(userId, filters);

    // Cleanup on unmount
    return () => {
      resetUserGames();
    };
  }, [userId, filters, fetchUserGames, resetUserGames]);

  const handleGameClick = useCallback(
    (gameId: string | number) => {
      router.push(`/game/${gameId}`);
    },
    [router]
  );

  const handleStatusChange = useCallback(
    async (gameId: string | number, newStatus: GameStatus) => {
      try {
        await updateGameStatus(gameId.toString(), newStatus);
      } catch (error) {
        // Error is already handled in the store
        console.error("Status update failed:", error);
      }
    },
    [updateGameStatus]
  );

  // Memoize the container class
  const containerClass = useMemo(
    () =>
      filters.view === "list"
        ? "flex flex-col space-y-3 sm:space-y-4 w-full"
        : "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6",
    [filters.view]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchUserGames(userId, filters)}
          className="text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Games Grid/List */}
      <div className={containerClass}>
        {games.map((game) => (
          <div
            key={game.id}
            className={filters.view === "list" ? "w-full" : "relative group"}
          >
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleGameClick(game.id);
              }}
            >
              <GameCard
                game={game}
                view={filters.view}
                onStatusChange={(status) => handleStatusChange(game.id, status)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <p className="text-gray-400 text-lg">
            No games found in your collection.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters or add some games to your collection.
          </p>
        </div>
      )}
    </div>
  );
}
