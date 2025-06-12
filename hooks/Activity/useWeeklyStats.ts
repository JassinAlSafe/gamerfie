import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface WeeklyStats {
  gamesPlayed: number;
  hoursPlayed: number;
  friendsAdded: number;
  gamesPlayedChange: string;
  hoursPlayedChange: string;
  friendsAddedChange: string;
  isGamesPlayedPositive: boolean;
  isHoursPlayedPositive: boolean;
  isFriendsAddedPositive: boolean;
}

export function useWeeklyStats(userId?: string) {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    gamesPlayed: 0,
    hoursPlayed: 0,
    friendsAdded: 0,
    gamesPlayedChange: '+0',
    hoursPlayedChange: '+0h',
    friendsAddedChange: '+0',
    isGamesPlayedPositive: true,
    isHoursPlayedPositive: true,
    isFriendsAddedPositive: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const calculateWeeklyStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get current week's gaming activity
      const { data: currentWeekGames, error: currentWeekError } = await supabase
        .from('user_games')
        .select('playtime_minutes, updated_at, game_id')
        .eq('user_id', userId)
        .gte('updated_at', oneWeekAgo.toISOString());

      if (currentWeekError) {
        console.error('Error fetching current week games:', currentWeekError);
        setError(currentWeekError.message);
        return;
      }

      // Get previous week's gaming activity for comparison
      const { data: previousWeekGames, error: previousWeekError } = await supabase
        .from('user_games')
        .select('playtime_minutes, updated_at, game_id')
        .eq('user_id', userId)
        .gte('updated_at', twoWeeksAgo.toISOString())
        .lt('updated_at', oneWeekAgo.toISOString());

      if (previousWeekError) {
        console.warn('Error fetching previous week games:', previousWeekError);
      }

      // Get current week's friends activity
      const { data: currentWeekFriends, error: currentFriendsError } = await supabase
        .from('friends')
        .select('created_at')
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .gte('created_at', oneWeekAgo.toISOString());

      if (currentFriendsError) {
        console.warn('Error fetching current week friends:', currentFriendsError);
      }

      // Get previous week's friends activity for comparison
      const { data: previousWeekFriends, error: previousFriendsError } = await supabase
        .from('friends')
        .select('created_at')
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

      if (previousFriendsError) {
        console.warn('Error fetching previous week friends:', previousFriendsError);
      }

      // Calculate current week stats
      const currentWeekUniqueGames = new Set(
        (currentWeekGames || []).map(game => game.game_id)
      ).size;

      const currentWeekPlaytime = Math.round(
        (currentWeekGames || []).reduce((total, game) => 
          total + (game.playtime_minutes || 0), 0
        ) / 60
      );

      const currentWeekFriendsCount = (currentWeekFriends || []).length;

      // Calculate previous week stats for comparison
      const previousWeekUniqueGames = new Set(
        (previousWeekGames || []).map(game => game.game_id)
      ).size;

      const previousWeekPlaytime = Math.round(
        (previousWeekGames || []).reduce((total, game) => 
          total + (game.playtime_minutes || 0), 0
        ) / 60
      );

      const previousWeekFriendsCount = (previousWeekFriends || []).length;

      // Calculate changes
      const gamesPlayedDiff = currentWeekUniqueGames - previousWeekUniqueGames;
      const hoursPlayedDiff = currentWeekPlaytime - previousWeekPlaytime;
      const friendsAddedDiff = currentWeekFriendsCount - previousWeekFriendsCount;

      setWeeklyStats({
        gamesPlayed: currentWeekUniqueGames,
        hoursPlayed: currentWeekPlaytime,
        friendsAdded: currentWeekFriendsCount,
        gamesPlayedChange: gamesPlayedDiff >= 0 ? `+${gamesPlayedDiff}` : `${gamesPlayedDiff}`,
        hoursPlayedChange: hoursPlayedDiff >= 0 ? `+${hoursPlayedDiff}h` : `${hoursPlayedDiff}h`,
        friendsAddedChange: friendsAddedDiff >= 0 ? `+${friendsAddedDiff}` : `${friendsAddedDiff}`,
        isGamesPlayedPositive: gamesPlayedDiff >= 0,
        isHoursPlayedPositive: hoursPlayedDiff >= 0,
        isFriendsAddedPositive: friendsAddedDiff >= 0
      });

    } catch (err) {
      console.error('Error calculating weekly stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    calculateWeeklyStats();
  }, [calculateWeeklyStats]);

  return {
    ...weeklyStats,
    isLoading,
    error,
    refetch: calculateWeeklyStats
  };
}