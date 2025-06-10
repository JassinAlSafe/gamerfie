import { useEffect, useState, useCallback } from 'react';
import { RAWGService } from '@/services/rawgService';
import { RAWGGameQueryParams } from '@/types/rawg';
import { Game } from '@/types/game';

export type GameQueryType = 'search' | 'popular' | 'upcoming' | 'trending';

interface UseRAWGOptions {
  initialPageSize?: number;
  enabled?: boolean;
  queryType?: GameQueryType;
}

interface GameQueryResult {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useRAWG(
  queryType: GameQueryType = 'popular',
  params?: RAWGGameQueryParams,
  options: UseRAWGOptions = {}
) {
  const { initialPageSize = 20, enabled = true } = options;
  const [data, setData] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    async (appendResults = false) => {
      if (!enabled || !hasMore) return;

      setIsLoading(true);
      setError(null);

      try {
        let result: GameQueryResult;

        switch (queryType) {
          case 'search':
            if (!params?.search) {
              setData([]);
              setHasMore(false);
              return;
            }
            result = await RAWGService.searchGames(params.search, page, initialPageSize) as GameQueryResult;
            break;
          case 'popular':
            result = await RAWGService.getPopularGames(page, initialPageSize) as GameQueryResult;
            break;
          case 'upcoming':
            result = await RAWGService.getUpcomingGames(page, initialPageSize) as GameQueryResult;
            break;
          case 'trending':
            result = await RAWGService.getTrendingGames(page, initialPageSize) as GameQueryResult;
            break;
          default:
            result = await RAWGService.getPopularGames(page, initialPageSize) as GameQueryResult;
        }

        setData(prev => (appendResults ? [...prev, ...result.games] : result.games));
        setTotal(result.total);
        setHasMore(result.hasNextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setIsLoading(false);
      }
    },
    [queryType, params, page, initialPageSize, enabled, hasMore]
  );

  const fetchNextPage = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (enabled) {
      fetchData(page === 1);
    }
  }, [fetchData, enabled, page]);

  return {
    data,
    isLoading,
    error,
    hasMore,
    total,
    page,
    fetchNextPage,
    refresh
  };
} 