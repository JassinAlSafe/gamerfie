import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface PlayStreakData {
  currentStreak: number;
  longestStreak: number;
  dailyActivity: boolean[]; // Last 7 days
  lastPlayedDays: number;
  weeklyPlaytime: number;
  weeklyGamesPlayed: number;
}

export function usePlayStreaks(userId?: string) {
  const [streakData, setStreakData] = useState<PlayStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    dailyActivity: [false, false, false, false, false, false, false],
    lastPlayedDays: 0,
    weeklyPlaytime: 0,
    weeklyGamesPlayed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const calculateStreaks = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get activities from the last 30 days for streak calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('created_at, type')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        setError(activitiesError.message);
        return;
      }

      // Get user games progress for playtime calculation
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weeklyProgress, error: progressError } = await supabase
        .from('user_games')
        .select('playtime_minutes, updated_at')
        .eq('user_id', userId)
        .gte('updated_at', oneWeekAgo.toISOString());

      if (progressError) {
        console.warn('Error fetching weekly progress:', progressError);
      }

      // Calculate daily activity for last 7 days
      const dailyActivity = new Array(7).fill(false);
      const activityDates = new Set<string>();

      (activities || []).forEach(activity => {
        const activityDate = new Date(activity.created_at);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 7) {
          dailyActivity[6 - daysDiff] = true; // Reverse order for display
          activityDates.add(activityDate.toDateString());
        }
      });

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toDateString();
        
        if (activityDates.has(dateString)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak (simplified - could be enhanced)
      let longestStreak = currentStreak;
      let tempStreak = 0;
      
      (activities || []).forEach(activity => {
        const activityDate = new Date(activity.created_at);
        const dateString = activityDate.toDateString();
        
        if (activityDates.has(dateString)) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

      // Calculate last played days
      const lastActivity = activities?.[0];
      const lastPlayedDays = lastActivity 
        ? Math.floor((new Date().getTime() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate weekly stats
      const weeklyPlaytime = (weeklyProgress || [])
        .reduce((total, game) => total + (game.playtime_minutes || 0), 0);
      
      const weeklyGamesPlayed = new Set(
        (weeklyProgress || []).map(game => game.updated_at)
      ).size;

      setStreakData({
        currentStreak,
        longestStreak,
        dailyActivity,
        lastPlayedDays,
        weeklyPlaytime: Math.round(weeklyPlaytime / 60), // Convert to hours
        weeklyGamesPlayed
      });

    } catch (err) {
      console.error('Error calculating streaks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    calculateStreaks();
  }, [calculateStreaks]);

  return {
    ...streakData,
    isLoading,
    error,
    refetch: calculateStreaks
  };
}