import { useQuery } from '@tanstack/react-query';
import { GameService } from '@/services/gameService';
import type { GameQueryParams } from '@/types/game';

export function useGames(params: GameQueryParams) {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => GameService.fetchGames(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

