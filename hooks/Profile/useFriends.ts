import { useEffect } from "react";
import { useFriendsStore } from "@/stores/useFriendsStore";

export function useFriends() {
  const { friends, isLoading, fetchFriends } = useFriendsStore();

  useEffect(() => {
    // Only try to fetch friends if we don't already have them and aren't loading
    if (friends.length === 0 && !isLoading) {
      fetchFriends().catch((error) => {
        // Silently handle the error since friends table may not exist
        console.warn('Friends feature not available:', error.message);
      });
    }
  }, [fetchFriends, friends.length, isLoading]);

  return {
    friends: friends || [], // Always return an array
    isLoading: isLoading || false,
    error: null, // Don't show errors for missing friends functionality
    refetch: fetchFriends
  };
} 