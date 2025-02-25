import { useEffect } from 'react';
import { useGameDetailsStore } from '@/stores/useGameDetailsStore';

export function useGameDetails(gameId: string | number) {
  const { games, isLoading, error, fetchGame } = useGameDetailsStore();

  useEffect(() => {
    if (gameId) {
      fetchGame(Number(gameId));
    }
  }, [gameId, fetchGame]);

  const game = games[Number(gameId)];

  return {
    game: game ? { ...game, timestamp: undefined } : null, // Remove timestamp from returned game
    isLoading,
    error
  };
} 