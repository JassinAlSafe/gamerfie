import { useEffect } from "react";
import { useFriendsStore } from "@/stores/useFriendsStore";

export function useFriends() {
  const { friends, isLoading, error, fetchFriends } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { friends, isLoading, error };
} 