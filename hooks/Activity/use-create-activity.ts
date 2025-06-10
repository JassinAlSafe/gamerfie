import { ActivityType } from '@/types/friend';
import { toast } from 'react-hot-toast';

interface ActivityDetails {
  name?: string;
  comment?: string;
  achievements?: { name: string }[];
  isBatched?: boolean;
}

export function useCreateActivity() {
  const createActivity = async (
    activityType: ActivityType,
    gameId: string | null,
    details?: ActivityDetails
  ) => {
    try {
      const response = await fetch('/api/friends/activities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: activityType,
          game_id: gameId,
          details,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }

      const activity = await response.json();
      return activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create activity');
      throw error;
    }
  };

  return { createActivity };
} 