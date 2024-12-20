import { useState, useEffect } from 'react';
import { ActivityType } from '@/types/friend';

interface GameActivity {
  id: string;
  type: ActivityType;
  details: any;
  timestamp: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export function useGameActivities(gameId: string) {
  const [activities, setActivities] = useState<GameActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/games/${gameId}/activities?page=${pageNum}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch game activities');
      }

      const data = await response.json();
      if (pageNum === 1) {
        setActivities(data);
      } else {
        setActivities(prev => [...prev, ...data]);
      }
      setHasMore(data.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchActivities(1);
    }
  }, [gameId]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
    }
  };

  return { activities, loading, error, hasMore, loadMore };
} 