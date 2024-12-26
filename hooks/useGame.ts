"use client";

import { useEffect } from "react";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";

export function useGame(id: string) {
  const { games, isLoading, error, fetchGame, getGame } = useGameDetailsStore();
  const numericId = parseInt(id, 10);

  useEffect(() => {
    if (!isNaN(numericId)) {
      fetchGame(numericId);
    }
  }, [numericId, fetchGame]);

  const game = getGame(numericId);

  return {
    game: game ? { ...game, timestamp: undefined } : null,
    isLoading,
    error
  };
} 