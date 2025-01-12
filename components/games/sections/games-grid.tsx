"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Game } from "@/types/game";
import { GameCard } from "@/components/games/cards/game-card";
import { useGamesStore } from "@/stores/useGamesStore";

interface GamesGridProps {
  isLoading: boolean;
  games: Game[];
}

export function GamesGrid({ isLoading, games }: GamesGridProps) {
  const { fetchMetadata } = useGamesStore();

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game: Game, index: number) => (
          <GameCard key={game.id} game={game} index={index} inView={true} />
        ))}
      </div>
    </div>
  );
}
