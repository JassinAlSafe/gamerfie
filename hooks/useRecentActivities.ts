import { useEffect, useMemo, useRef, useState } from 'react';
import { useFriendsStore } from '@/stores/useFriendsStore';
import { useAuthUser, useAuthStatus } from '@/stores/useAuthStoreOptimized';

export function useRecentActivities(limit: number = 5) {
  const { activities, isLoadingActivities, error } = useFriendsStore();
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const hasFetched = useRef(false);
  const [stableLoading, setStableLoading] = useState(true);

  useEffect(() => {
    // Only fetch if authenticated and we haven't fetched before
    if (!hasFetched.current && isInitialized && user) {
      hasFetched.current = true;
      // Use direct store access to avoid dependency issues
      useFriendsStore.getState().fetchActivities().catch((error) => {
        console.warn('Activities feature not available:', error.message);
      });
    }
  }, [isInitialized, user]); // Re-run when auth state changes

  // Stable loading state - only set to false after initial fetch attempt
  useEffect(() => {
    if (hasFetched.current && !isLoadingActivities) {
      setStableLoading(false);
    }
  }, [isLoadingActivities]);

  // Memoize the transformation to avoid recalculation
  const recentActivities = useMemo(() => {
    return activities
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        type: activity.type,
        user_id: activity.user?.id || '',
        game_id: activity.game?.id || '',
        user: activity.user ? {
          username: activity.user.username,
          avatar_url: activity.user.avatar_url || undefined
        } : undefined,
        game: activity.game ? {
          name: activity.game.name,
          coverImage: activity.game.cover_url
        } : undefined,
        details: activity.details,
        created_at: activity.created_at,
      }));
  }, [activities, limit]);

  return {
    activities: recentActivities,
    isLoading: stableLoading,
    error,
  };
} 