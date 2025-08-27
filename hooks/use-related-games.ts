import { useState, useEffect } from 'react';
import { Game, GameApiResponse, SafeGameAccess } from '@/types';
import { processRelatedGames } from '@/utils/game-data-utils';

interface UseRelatedGamesOptions {
  limit?: number;
  requireCover?: boolean;
  requireRating?: boolean;
}

interface UseRelatedGamesResult {
  relatedGames: SafeGameAccess[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Inevitable hook for related games - handles all the complexity internally
 * Returns type-safe, processed game data ready for display
 */
export function useRelatedGames(
  game: Game,
  options: UseRelatedGamesOptions = {}
): UseRelatedGamesResult {
  const { limit = 8 } = options;
  
  const [relatedGames, setRelatedGames] = useState<SafeGameAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract genres from current game - inevitable pattern
      const genreNames = game.genres?.map(g => g.name).slice(0, 2) || [];
      
      const searchParams = new URLSearchParams({
        page: '1',
        limit: String(limit + 4), // Fetch more to account for filtering
        sortBy: 'popularity'
      });

      if (genreNames.length > 0) {
        searchParams.append('genres', genreNames.join(','));
      }

      const response = await fetch(`/api/games?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch related games: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Type-safe processing - no 'any' types needed
      const rawGames: GameApiResponse[] = data.games || [];
      
      // Use our inevitable utility to process games
      const processed = processRelatedGames(rawGames, game.id, limit);
      
      setRelatedGames(processed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load related games';
      console.error('Error fetching related games:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatedGames();
  }, [game.id, game.genres, limit]);

  return {
    relatedGames,
    loading,
    error,
    refresh: fetchRelatedGames
  };
}

/**
 * Alternative hook for when you need more control over the data
 * Returns raw API response with type safety
 */
export function useRelatedGamesRaw(game: Game) {
  const [games, setGames] = useState<GameApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);

        const genreNames = game.genres?.map(g => g.name).slice(0, 2) || [];
        
        const searchParams = new URLSearchParams({
          page: '1',
          limit: '12',
          sortBy: 'popularity'
        });

        if (genreNames.length > 0) {
          searchParams.append('genres', genreNames.join(','));
        }

        const response = await fetch(`/api/games?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch related games');
        }

        const data = await response.json();
        const rawGames: GameApiResponse[] = data.games || [];
        
        // Filter out current game but keep raw format
        const filtered = rawGames.filter(g => g.id !== game.id);
        setGames(filtered);
      } catch (err) {
        console.error('Error fetching related games:', err);
        setError('Failed to load related games');
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [game.id, game.genres]);

  return { games, loading, error };
}