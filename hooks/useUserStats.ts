import { useState, useEffect } from 'react';
import { useAuthUser } from '@/stores/useAuthStoreOptimized';

interface UserStats {
  total_games: number;
  completed_games: number;
  total_playtime: number;
  avg_rating: number;
  recent_activities: number;
  journal: {
    total_entries: number;
    total_reviews: number;
    avg_rating: number;
    total_playtime: number;
  };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthUser();

  useEffect(() => {
    // Don't fetch stats if user is not authenticated
    if (!user) {
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/stats');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]); // Re-run when user authentication changes

  const refresh = async () => {
    const response = await fetch('/api/user/stats');
    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh
  };
} 