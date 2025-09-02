import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useUserSearch } from "@/hooks/Profile/use-user-search";
import toast from "react-hot-toast";
import type { 
  Friend, 
  FriendStats, 
  UseFriendsPageReturn 
} from "@/types/friends-system.types";

export function useFriendsPage(): UseFriendsPageReturn {
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendsFilter, setFriendsFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { addFriend, friends, fetchFriends } = useFriendsStore();
  const { searchResults, isSearching, searchError, searchUsers, clearSearch } = useUserSearch();

  // Session check effect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        setIsSessionLoading(false);
        await fetchFriends();
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionLoading(false);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router, fetchFriends]);

  // Memoized calculations
  const acceptedFriends = useMemo((): Friend[] => {
    return friends.filter((friend) => friend.status === "accepted");
  }, [friends]);

  const filteredFriends = useMemo((): Friend[] => {
    let filtered: Friend[] = [...acceptedFriends];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((friend) =>
        friend.username?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (friendsFilter !== "all") {
      filtered = filtered.filter((friend) => {
        switch (friendsFilter) {
          case "online":
            return friend.online_status === "online";
          case "offline":
            return friend.online_status === "offline";
          case "recent":
            return true; // Would need last_active field
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [acceptedFriends, searchQuery, friendsFilter]);

  const friendStats = useMemo((): FriendStats => {
    const online = acceptedFriends.filter(f => f.online_status === "online").length;
    const offline = acceptedFriends.filter(f => f.online_status === "offline").length;
    
    return {
      total: acceptedFriends.length,
      online,
      offline,
      recent: acceptedFriends.length, // Would need last_active field
    };
  }, [acceptedFriends]);

  // Action handlers
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchFriends();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchFriends]);

  const sendFriendRequest = useCallback(async (friendId: string, username: string) => {
    try {
      await addFriend({ friendId });
      toast.success("Friend request sent!");
      // Refresh search results
      searchUsers(searchQuery);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error((error as Error).message || "Failed to send friend request");
    }
  }, [addFriend, searchUsers, searchQuery]);

  const acceptFriendRequest = useCallback(async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      toast.success("Friend request accepted!");
      // Refresh friends list and search results
      fetchFriends();
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(
        (error as Error).message || "Failed to accept friend request"
      );
    }
  }, [fetchFriends, searchUsers, searchQuery]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFriendsFilter("all");
  }, []);

  return {
    // State
    isSessionLoading,
    searchQuery,
    setSearchQuery,
    friendsFilter,
    setFriendsFilter,
    isRefreshing,
    
    // Computed values
    acceptedFriends,
    filteredFriends,
    friendStats,
    
    // Search functionality
    searchResults,
    isSearching,
    searchError,
    searchUsers,
    clearSearch,
    
    // Actions
    handleRefresh,
    sendFriendRequest,
    acceptFriendRequest,
    clearFilters,
  };
}