"use client";

import { useEffect } from "react";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types/game";

interface GamesResponse {
  games: Game[];
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

  const { data: trendingData } = useQuery<GamesResponse>({
    queryKey: ['trending-games'],
    queryFn: async () => {
      const response = await fetch('/api/games/trending');
      if (!response.ok) throw new Error('Failed to fetch trending games');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: popularData } = useQuery<GamesResponse>({
    queryKey: ['popular-games'],
    queryFn: async () => {
      const response = await fetch('/api/games/popular');
      if (!response.ok) throw new Error('Failed to fetch popular games');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: upcomingData } = useQuery<GamesResponse>({
    queryKey: ['upcoming-games'],
    queryFn: async () => {
      const response = await fetch('/api/games/upcoming');
      if (!response.ok) throw new Error('Failed to fetch upcoming games');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    game: game ? { ...game, timestamp: undefined } : null,
    isLoading,
    error,
    trendingGames: trendingData?.games || [],
    popularGames: popularData?.games || [],
    upcomingGames: upcomingData?.games || [],
    isGamesLoading: !trendingData || !popularData || !upcomingData,
    gamesError: null
  };
}