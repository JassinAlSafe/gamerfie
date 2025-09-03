"use client";

import React, { useEffect, useState } from 'react';
import { GameDetails } from './GameDetails';
import { IGDBService } from '@/services/igdb';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { Game } from '@/types';

interface GameDetailWrapperProps {
  gameId: string;
}

export default function GameDetailWrapper({ gameId }: GameDetailWrapperProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGame() {
      if (!gameId) {
        setError('Game ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Extract numeric ID from the gameId (remove 'igdb_' prefix if present)
        const numericGameId = gameId.replace('igdb_', '');
        const gameData = await IGDBService.fetchGameDetails(numericGameId);

        if (!gameData) {
          setError('Game not found');
          setLoading(false);
          return;
        }

        // Transform IGDB data to our Game interface
        const transformedGame: Game = {
          id: gameData.id,
          name: gameData.name || 'Unknown Game',
          summary: gameData.summary || '',
          cover: gameData.cover_url ? {
            id: gameData.id.replace('igdb_', ''),
            url: gameData.cover_url
          } : undefined,
          screenshots: gameData.screenshots || [],
          videos: gameData.videos || [],
          genres: gameData.genres?.map((name: string) => ({ name })) || [],
          platforms: gameData.platforms?.map((name: string) => ({ name })) || [],
          first_release_date: gameData.first_release_date,
          total_rating: gameData.rating,
          total_rating_count: 0, // Not provided by fetchGameDetails
          involved_companies: gameData.involved_companies || [],
          achievements: { total: 0, completed: 0 }, // Default achievements
        };

        setGame(transformedGame);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={error} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error="Game not found" />
      </div>
    );
  }

  return <GameDetails game={game} />;
}