import { useState, useEffect, useCallback } from 'react';
import { GameActivityFeed, GameActivity } from '@/types/activity';
import { toast } from 'react-hot-toast';

export function useGameActivities(gameId: string) {
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchActivities = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/games/${gameId}/activities?page=${pageNum}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch game activities');
      }

      const { data, hasMore }: GameActivityFeed = await response.json();
      
      if (pageNum === 1) {
        setActivities(data);
      } else {
        setActivities(prev => [...prev, ...data]);
      }
      
      setHasMore(hasMore);
      
      if (isInitial) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      setPage(1);
      setActivities([]);
      setHasMore(true);
      setIsInitialLoad(true);
      fetchActivities(1, true);
    }
  }, [gameId, fetchActivities]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
    }
  }, [loading, hasMore, page, fetchActivities]);

  return {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    isInitialLoad,
    refetch: () => fetchActivities(1, true)
  };
} 