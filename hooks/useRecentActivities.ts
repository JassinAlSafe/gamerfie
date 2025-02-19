import { useEffect } from 'react';
import { useFriendsStore } from '@/stores/useFriendsStore';
import type { ActivityType } from '@/types/activity';

export function useRecentActivities(limit: number = 5) {
  const { activities, isLoadingActivities, error, fetchActivities } = useFriendsStore();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Get the most recent activities
  const recentActivities = activities
    .slice(0, limit)
    .map(activity => ({
      id: activity.id,
      type: activity.type,
      user_id: activity.user?.id || '',
      game_id: activity.game?.id || '',
      user: activity.user,
      game: activity.game ? {
        name: activity.game.name,
        coverImage: activity.game.cover_url
      } : undefined,
      details: activity.details,
      created_at: activity.created_at,
    }));

  return {
    activities: recentActivities,
    isLoading: isLoadingActivities,
    error,
  };
} 