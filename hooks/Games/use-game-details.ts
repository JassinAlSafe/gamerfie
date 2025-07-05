import { useEffect } from 'react';
import { useGameDetailsStore, selectGame, selectGameError, selectGameLoading } from '@/stores/useGameDetailsStore';

export function useGameDetails(gameId: string | number) {
  const stringGameId = String(gameId);
  
  // Use selectors for better performance
  const game = useGameDetailsStore(selectGame(stringGameId));
  const error = useGameDetailsStore(selectGameError(stringGameId));
  const isLoading = useGameDetailsStore(selectGameLoading(stringGameId));
  const fetchGame = useGameDetailsStore((state) => state.fetchGame);

  useEffect(() => {
    if (stringGameId) {
      fetchGame(stringGameId);
    }
  }, [stringGameId, fetchGame]);

  return {
    game: game ? { ...game, timestamp: undefined, fetchCount: undefined, lastAccessed: undefined, source: undefined } : null,
    isLoading,
    error
  };
} 