"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGameDetailsStore } from '@/stores/useGameDetailsStore';
import { GameDetails } from '@/components/game-details';
import LoadingSpinner from '@/components/loadingSpinner';

export default function GamePage() {
  const params = useParams();
  const gameId = parseInt(params.id as string);
  const { 
    games,
    isLoading,
    error,
    fetchGame
  } = useGameDetailsStore();

  useEffect(() => {
    if (gameId) {
      fetchGame(gameId);
    }
  }, [gameId, fetchGame]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const game = games[gameId];
  if (!game) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Game not found</p>
      </div>
    );
  }

  return <GameDetails game={game} />;
}
