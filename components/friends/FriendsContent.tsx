"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Friend, FriendStatus } from "@/types/friend";
import { FriendSearchSection } from "./FriendSearchSection";
import { FriendsGridSection } from "./FriendsGridSection";
import LoadingSpinner from "@/components/loadingSpinner";
import { Shell } from "@/app/layout/shell";
import { Users, UserPlus, Clock, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function FriendsContent() {
  const { user, isLoading: authLoading, isInitialized } = useAuthStore();
  const {
    friends,
    fetchFriends,
    addFriend,
    updateFriendStatus,
    isLoading: friendsLoading,
  } = useFriendsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Memoize computed values - must be called consistently at top level
  const acceptedFriends = useMemo(
    () => friends.filter((friend) => friend.status === "accepted"),
    [friends]
  );

  const pendingFriends = useMemo(
    () => friends.filter((friend) => friend.status === "pending"),
    [friends]
  );

  const onlineFriendsCount = useMemo(
    () => acceptedFriends.filter((f) => f.online_status === "online").length,
    [acceptedFriends]
  );

  // Initialize data fetch
  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user, fetchFriends]); // Use store fetchFriends

  // Loading timeout detection
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || friendsLoading) {
        setLoadingTimedOut(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading, friendsLoading]);

  // Reset timeout when loading completes
  useEffect(() => {
    if (!authLoading && !friendsLoading) {
      setLoadingTimedOut(false);
    }
  }, [authLoading, friendsLoading]);

  // Handle authentication redirect - only redirect if auth is fully initialized and user is definitely not logged in
  useEffect(() => {
    if (!user && !authLoading && isInitialized) {
      router.push("/signin");
    }
  }, [user, authLoading, isInitialized, router]);

  // Search users function
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      if (!user) return;

      try {
        setIsSearching(true);

        // Get profiles that match the search query
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", `%${query}%`)
          .neq("id", user.id) // Exclude current user
          .limit(10);

        if (profilesError) throw profilesError;
        if (!profilesData) return;

        // Get all friend relationships for these profiles
        const userIds = profilesData.map((profile) => profile.id);
        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select("*")
          .or(
            `and(user_id.eq.${user.id},friend_id.in.(${userIds.join(",")})),` +
              `and(friend_id.eq.${user.id},user_id.in.(${userIds.join(",")}))`
          );

        if (friendsError) throw friendsError;

        // Transform profiles into Friend type with friendship status
        const transformedResults = profilesData.map((profile) => {
          const friendship = friendsData?.find(
            (f) =>
              (f.friend_id === profile.id && f.user_id === user.id) ||
              (f.user_id === profile.id && f.friend_id === user.id)
          );

          return {
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            status: friendship?.status || null,
            sender_id: friendship?.user_id || null,
            online_status: profile.online_status || "offline",
          } as Friend;
        });

        setSearchResults(transformedResults);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    },
    [user, supabase]
  );

  // Send friend request function
  const sendFriendRequest = useCallback(
    async (friendId: string) => {
      try {
        await addFriend({ friendId });
        toast.success("Friend request sent!");
        // Refresh search results if we have a query
        if (searchQuery) {
          searchUsers(searchQuery);
        }
      } catch (error) {
        console.error("Error sending friend request:", error);
        toast.error(
          (error as Error).message || "Failed to send friend request"
        );
      }
    },
    [addFriend, searchQuery, searchUsers]
  );

  // Accept friend request function
  const acceptFriendRequest = useCallback(
    async (friendId: string) => {
      try {
        await updateFriendStatus(friendId, "accepted");
        toast.success("Friend request accepted!");
        // Refresh search results if we have a query
        if (searchQuery) {
          searchUsers(searchQuery);
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
        toast.error(
          (error as Error).message || "Failed to accept friend request"
        );
      }
    },
    [updateFriendStatus, searchQuery, searchUsers]
  );

  // Decline friend request function
  const declineFriendRequest = useCallback(
    async (friendId: string) => {
      try {
        await updateFriendStatus(friendId, "declined");
        toast.success("Friend request declined");
        // Refresh search results if we have a query
        if (searchQuery) {
          searchUsers(searchQuery);
        }
      } catch (error) {
        console.error("Error declining friend request:", error);
        toast.error(
          (error as Error).message || "Failed to decline friend request"
        );
      }
    },
    [updateFriendStatus, searchQuery, searchUsers]
  );

  // Helper function to determine friendship status
  const getFriendshipStatus = useCallback(
    (
      searchUser: Friend
    ): { status: FriendStatus; isSender: boolean } | null => {
      if (!user || !searchUser.status) return null;

      return {
        status: searchUser.status as FriendStatus,
        isSender: searchUser.sender_id === user.id,
      };
    },
    [user]
  );

  // Loading state with timeout handling - show loading if auth is not initialized or still loading
  if ((!isInitialized || authLoading) && !loadingTimedOut && !user) {
    return (
      <Shell maxWidth="6xl" padding="lg">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </Shell>
    );
  }

  // Loading timeout state
  if (loadingTimedOut) {
    return (
      <Shell maxWidth="6xl" padding="lg">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Loading Taking Longer Than Expected
            </h2>
            <p className="text-muted-foreground mb-4">
              The friends page is taking longer to load than usual.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // Still loading auth, show loading
  if (!user) {
    return (
      <Shell maxWidth="6xl" padding="lg">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </Shell>
    );
  }

  return (
    <Shell maxWidth="6xl" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Friends
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with fellow gamers, discover new friends, and build your
            gaming community. Share achievements, compare game progress, and
            compete on leaderboards together.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FriendSearchSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={searchUsers}
            onSendFriendRequest={sendFriendRequest}
            onAcceptFriendRequest={acceptFriendRequest}
            getFriendshipStatus={getFriendshipStatus}
          />
        </motion.div>

        {/* Pending Requests Section */}
        {pendingFriends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/20">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Pending Friend Requests ({pendingFriends.length})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Accept or decline incoming friend requests
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingFriends.map((friend, index) => {
                const isIncoming = friend.sender_id !== user?.id;
                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-5 bg-card/50 border-border/30 hover:bg-card/70 hover:border-orange-500/30 transition-all duration-300 rounded-xl group">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="ring-2 ring-border/20 group-hover:ring-orange-500/30 transition-all w-12 h-12">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                              {friend.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-orange-400 transition-colors truncate">
                              {friend.username}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isIncoming
                                ? "Sent you a request"
                                : "Request sent"}
                            </p>
                          </div>
                        </div>
                        {isIncoming && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 text-green-400"
                              onClick={() => acceptFriendRequest(friend.id)}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400"
                              onClick={() => declineFriendRequest(friend.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Friends Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FriendsGridSection
            friends={acceptedFriends}
            isLoading={friendsLoading}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="group p-6 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm text-center hover:border-blue-500/30 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
              {acceptedFriends.length}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Total Friends
            </p>
            <div className="mt-2 w-full bg-border/20 rounded-full h-1.5">
              <div
                className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (acceptedFriends.length / 20) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="group p-6 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm text-center hover:border-green-500/30 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors relative">
                <Users className="h-6 w-6 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 group-hover:text-green-400 transition-colors">
              {onlineFriendsCount}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Online Now
            </p>
            <div className="mt-2 w-full bg-border/20 rounded-full h-1.5">
              <div
                className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    acceptedFriends.length > 0
                      ? (onlineFriendsCount / acceptedFriends.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="group p-6 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm text-center hover:border-purple-500/30 hover:bg-card/70 transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <UserPlus className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 group-hover:text-purple-400 transition-colors">
              {pendingFriends.length}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Pending Requests
            </p>
            {pendingFriends.length > 0 && (
              <div className="mt-2 flex justify-center">
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  Needs attention
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}
