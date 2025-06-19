import { useEffect, useMemo, useCallback } from 'react';
import { useProfile } from "@/hooks/Profile/use-profile";
import { useUserStats } from "@/hooks/useUserStats";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useJournalStore } from "@/stores/useJournalStore";
import { isValidGameStats } from "@/utils/profile-validation";
import type { GameStats } from "@/types/user";
import type { FriendActivity } from "@/types/activity";
import type { JournalEntry } from "@/types/journal";
import type { Friend } from "@/types/friend";

export const useProfileData = () => {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const {
    stats: optimizedStats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useUserStats();
  
  const {
    friends,
    fetchFriends,
    isLoading: friendsLoading,
    activities,
    fetchActivities,
    isLoading: activitiesLoading,
  } = useFriendsStore();
  
  const {
    entries,
    fetchEntries,
    isLoading: journalLoading,
  } = useJournalStore();

  // Optimized data fetching with parallel requests and proper error handling
  const initializeData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // Fetch all data in parallel instead of sequential timeouts
      await Promise.allSettled([
        fetchFriends(),
        fetchActivities(),
        fetchEntries(),
      ]);
    } catch (error) {
      // Handle any critical errors silently - individual fetches handle their own errors
      console.error("Error during data initialization:", error);
    }
  }, [profile?.id, fetchFriends, fetchActivities, fetchEntries]);

  // Initialize data when profile is available
  useEffect(() => {
    if (profile?.id && !friendsLoading && !activitiesLoading && !journalLoading) {
      initializeData();
    }
  }, [profile?.id, initializeData]); // Removed loading states from dependencies to prevent loops

  // Memoized calculations with proper error handling
  const totalGames = useMemo<number>(
    () => (isValidGameStats(gameStats) ? gameStats.total_played : 0),
    [gameStats]
  );

  const acceptedFriends = useMemo<Friend[]>(
    () => friends.filter((friend) => friend.status === "accepted"),
    [friends]
  );

  const recentReviews = useMemo<JournalEntry[]>(
    () => {
      try {
        return entries
          .filter((entry) => entry.type === "review")
          .slice(0, 3);
      } catch {
        return [];
      }
    },
    [entries]
  );

  const recentActivities = useMemo<FriendActivity[]>(
    () => {
      try {
        return activities.slice(0, 5);
      } catch {
        return [];
      }
    },
    [activities]
  );

  const recentJournalEntries = useMemo<JournalEntry[]>(
    () => {
      try {
        return entries.slice(0, 3);
      } catch {
        return [];
      }
    },
    [entries]
  );

  // Aggregate loading state
  const isDataLoading = useMemo(
    () => isLoading || friendsLoading || activitiesLoading || journalLoading,
    [isLoading, friendsLoading, activitiesLoading, journalLoading]
  );

  return {
    // Profile data
    profile,
    isLoading,
    error,
    gameStats: gameStats as GameStats,
    updateProfile,
    
    // Stats data
    optimizedStats,
    statsLoading,
    refreshStats,
    
    // Loading states
    friendsLoading,
    activitiesLoading,
    journalLoading,
    isDataLoading,
    
    // Calculated data
    totalGames,
    acceptedFriends,
    recentReviews,
    recentActivities,
    recentJournalEntries,
  };
};