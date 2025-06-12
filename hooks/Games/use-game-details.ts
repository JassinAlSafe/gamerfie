import { useEffect } from 'react';
import { useGameDetailsStore } from '@/stores/useGameDetailsStore';

export function useGameDetails(gameId: string | number) {
  const { games, isLoading, error, fetchGame } = useGameDetailsStore();

  // Convert gameId to string for consistent handling
  const stringGameId = String(gameId);

  useEffect(() => {
    if (stringGameId) {
      fetchGame(stringGameId);
    }
  }, [stringGameId, fetchGame]);

  const game = games[stringGameId];

  return {
    game: game ? { ...game, timestamp: undefined } : null, // Remove timestamp from returned game
    isLoading,
    error
  };
} 