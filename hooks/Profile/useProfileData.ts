import { useEffect, useState, useMemo } from 'react';
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

  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Optimize data fetching with sequential loading
  useEffect(() => {
    if (isDataLoaded || friendsLoading || activitiesLoading || journalLoading) {
      return;
    }

    console.log("Starting data fetch sequence");

    const friendsTimeout = setTimeout(() => {
      console.log("Fetching friends...");
      fetchFriends().catch((err) =>
        console.error("Error fetching friends:", err)
      );

      const activitiesTimeout = setTimeout(() => {
        console.log("Fetching activities...");
        fetchActivities().catch((err) =>
          console.error("Error fetching activities:", err)
        );

        const journalTimeout = setTimeout(() => {
          console.log("Fetching journal entries...");
          fetchEntries().catch((err) =>
            console.error("Error fetching journal entries:", err)
          );
          setIsDataLoaded(true);
        }, 300);

        return () => clearTimeout(journalTimeout);
      }, 300);

      return () => clearTimeout(activitiesTimeout);
    }, 0);

    return () => clearTimeout(friendsTimeout);
  }, [
    isDataLoaded,
    friendsLoading,
    activitiesLoading,
    journalLoading,
    friends.length,
    activities.length,
    entries.length,
    fetchFriends,
    fetchActivities,
    fetchEntries,
  ]);

  // Debug logging for activities
  useEffect(() => {
    console.log("Activities state:", {
      count: activities.length,
      loading: activitiesLoading,
      isDataLoaded,
    });

    if (activities.length === 0 && !activitiesLoading && isDataLoaded) {
      console.log("Attempting to refetch activities...");
      fetchActivities().catch((err) =>
        console.error("Error refetching activities:", err)
      );
    }
  }, [activities.length, activitiesLoading, isDataLoaded, fetchActivities]);

  // Memoized calculations
  const totalGames = useMemo<number>(
    () => (isValidGameStats(gameStats) ? gameStats.total_played : 0),
    [gameStats]
  );

  const acceptedFriends = useMemo<Friend[]>(
    () => friends.filter((friend) => friend.status === "accepted"),
    [friends]
  );

  const recentReviews = useMemo<JournalEntry[]>(
    () =>
      entries
        .filter((entry) => entry.type === "review")
        .slice(0, 3),
    [entries]
  );

  const recentActivities = useMemo<FriendActivity[]>(
    () => activities.slice(0, 5),
    [activities]
  );

  const recentJournalEntries = useMemo<JournalEntry[]>(
    () => entries.slice(0, 3),
    [entries]
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
    
    // Calculated data
    totalGames,
    acceptedFriends,
    recentReviews,
    recentActivities,
    recentJournalEntries,
  };
};