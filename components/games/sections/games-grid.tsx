"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Game } from "@/types/game";
import { GameCard } from "@/components/games/cards/game-card";
import { useGamesStore } from "@/stores/useGamesStore";

interface GamesGridProps {
  isLoading: boolean;
  games: Game[];
  inView: boolean;
  hasNextPage: boolean;
}

export function GamesGrid({
  isLoading,
  games,
  inView,
  hasNextPage,
}: GamesGridProps) {
  const { fetchMetadata, fetchGames } = useGamesStore();

  useEffect(() => {
    void fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchGames();
    }
  }, [inView, hasNextPage, fetchGames]);

  if (isLoading) {
    return (
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!games?.length) {
    return (
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 text-gray-400">
          No games found matching your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {games.map((game: Game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
