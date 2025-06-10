import { useEffect, useRef, useState } from "react";
import { useFriendsStore } from "@/stores/useFriendsStore";

export function useFriends() {
  const { friends, isLoading } = useFriendsStore();
  const hasFetched = useRef(false);
  const [stableLoading, setStableLoading] = useState(true);

  useEffect(() => {
    // Only try to fetch friends if we haven't tried before
    if (!hasFetched.current) {
      hasFetched.current = true;
      
      // Use direct store access to avoid dependency issues
      useFriendsStore.getState().fetchFriends().catch((error) => {
        // Silently handle the error since friends table may not exist
        console.warn('Friends feature not available:', error.message);
      });
    }
  }, []); // Only run once on mount

  // Stable loading state - only set to false after initial fetch attempt
  useEffect(() => {
    if (hasFetched.current && !isLoading) {
      setStableLoading(false);
    }
  }, [isLoading]);

  return {
    friends: friends || [], // Always return an array
    isLoading: stableLoading,
    error: null, // Don't show errors for missing friends functionality
    refetch: () => useFriendsStore.getState().fetchFriends()
  };
} 