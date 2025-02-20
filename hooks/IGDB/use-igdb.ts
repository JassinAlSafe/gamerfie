import { useQuery } from '@tanstack/react-query';
import { IGDBService } from '@/services/igdb';
import type { Game } from '@/types/game';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

interface IGDBGameResponse {
  id: string;
  name: string;
  cover_url?: string;
  background_image?: string;
  rating?: number;
  first_release_date?: number;
  platforms?: Array<{ id: string; name: string }>;
  genres?: Array<{ id: string; name: string }>;
  summary?: string;
  storyline?: string;
  total_rating?: number;
  total_rating_count?: number;
}

// Helper function to transform IGDB data to our Game type
function transformIGDBGame(game: IGDBGameResponse): Game {
  return {
    id: game.id,
    name: game.name,
    cover_url: game.cover_url,
    background_image: game.background_image,
    rating: game.rating,
    first_release_date: game.first_release_date,
    platforms: game.platforms || [],
    genres: game.genres || [],
    summary: game.summary,
    storyline: game.storyline,
    total_rating: game.total_rating,
    total_rating_count: game.total_rating_count
  };
}

// Remove duplicate useGameDetails hook and export the one from use-game-details
export { useGameDetails } from '@/hooks/Games/use-game-details';

export function useGameAchievements(gameId: string | number) {
  const numericId = typeof gameId === 'string' ? gameId : gameId.toString();

  return useQuery({
    queryKey: ['game-achievements', numericId],
    queryFn: () => IGDBService.fetchGameAchievements(numericId),
    staleTime: STALE_TIME,
    enabled: !!numericId
  });
}

export function useRelatedGames(gameId: string | number) {
  const numericId = typeof gameId === 'string' ? gameId : gameId.toString();

  return useQuery<Game[]>({
    queryKey: ['related-games', numericId],
    queryFn: async () => {
      const games = await IGDBService.fetchRelatedGames(numericId);
      return games.map((game: any) => transformIGDBGame(game));
    },
    staleTime: STALE_TIME,
    enabled: !!numericId
  });
}

export function usePopularGames(limit: number = 10) {
  return useQuery<Game[]>({
    queryKey: ['popular-games', limit],
    queryFn: async () => {
      const games = await IGDBService.getPopularGames(limit);
      return games.map((game: any) => transformIGDBGame(game));
    },
    staleTime: STALE_TIME
  });
}

export function useTrendingGames(limit: number = 10) {
  return useQuery<Game[]>({
    queryKey: ['trending-games', limit],
    queryFn: async () => {
      const games = await IGDBService.getTrendingGames(limit);
      return games.map((game: any) => transformIGDBGame(game));
    },
    staleTime: STALE_TIME
  });
}

export function useUpcomingGames(limit: number = 10) {
  return useQuery<Game[]>({
    queryKey: ['upcoming-games', limit],
    queryFn: async () => {
      const games = await IGDBService.getUpcomingGames(limit);
      return games.map((game: any) => transformIGDBGame(game));
    },
    staleTime: STALE_TIME
  });
} 