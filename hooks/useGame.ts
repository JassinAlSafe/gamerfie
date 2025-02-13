"use client";

import { useEffect } from "react";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";
import { useQuery } from "@tanstack/react-query"; // Updated import
import { Game } from "@/types/game";

interface TrendingGamesResponse {
  trending: Game[];
}

export function useGame(id: string) {
  const { isLoading, error, fetchGame, getGame } = useGameDetailsStore();
  const numericId = parseInt(id, 10);

  useEffect(() => {
    if (!isNaN(numericId)) {
      fetchGame(numericId);
    }
  }, [numericId, fetchGame]);

  const game = getGame(numericId);

  const {
    data: trendingGames,
    isLoading: isTrendingLoading,
    error: trendingError
  } = useQuery<TrendingGamesResponse>({
    queryKey: ['trending-games'],
    queryFn: async () => {
      const response = await fetch('/api/games/popular');
      if (!response.ok) {
        throw new Error('Failed to fetch trending games');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    select: (data: TrendingGamesResponse) => ({
      trending: data.trending
    })
  });

  return {
    game: game ? { ...game, timestamp: undefined } : null,
    isLoading,
    error,
    trendingGames: trendingGames?.trending || [],
    isTrendingLoading,
    trendingError
  };
}