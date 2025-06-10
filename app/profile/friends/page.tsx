"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/Profile/use-profile";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  Users,
  X,
  Gamepad,
  Clock,
  Check,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriendsStore } from "@/stores/useFriendsStore";
import toast from "react-hot-toast";
import { Friend, OnlineStatus, FriendStatus } from "@/types/friend";

export default function ProfileFriendsPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const supabase = createClient();
  const router = useRouter();
  const { addFriend, friends, fetchFriends } = useFriendsStore();

  // Check session and fetch friends
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.access_token) {
          console.log("No valid session found, redirecting to login");
          router.push("/login");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(session.access_token);

        if (userError || !user?.id) {
          console.error("Error getting user:", userError);
          router.push("/login");
          return;
        }

        setIsSessionLoading(false);
        fetchFriends();
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionLoading(false);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router, fetchFriends]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // First get the current user's session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No authenticated user");

      // Get profiles that match the search query
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .limit(5);

      if (profilesError) throw profilesError;
      if (!profilesData) return;

      // Get all friend relationships for these profiles
      const userIds = profilesData.map((profile) => profile.id);
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${session.user.id},friend_id.in.(${userIds.join(
            ","
          )})),` +
            `and(friend_id.eq.${session.user.id},user_id.in.(${userIds.join(
              ","
            )}))`
        );

      if (friendsError) throw friendsError;

      // Transform profiles into Friend type with friendship status
      const transformedResults = profilesData.map((profile) => {
        const friendship = friendsData?.find(
          (f) => f.friend_id === profile.id || f.user_id === profile.id
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
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      await addFriend({ friendId });
      toast.success("Friend request sent!");
      // Refresh search results
      searchUsers(searchQuery);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error((error as Error).message || "Failed to send friend request");
    }
  };

  // First, let's add a helper function to determine the friendship status
  const getFriendshipStatus = (
    user: Friend
  ): { status: FriendStatus; isSender: boolean } | null => {
    if (!profile || !user.status) return null;

    return {
      status: user.status as FriendStatus,
      isSender: user.sender_id === profile.id,
    };
  };

  if (profileLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">
          {profileError?.message || "Profile not found"}
        </p>
      </div>
    );
  }

  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

      {/* Main Content Container */}
      <div className="relative flex flex-col flex-grow">
        {/* Profile Header Section */}
        <div className="pt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={
                gameStats ? {
                  ...gameStats,
                  totalGames: gameStats.total_played,
                  totalPlaytime: 0,
                  recentlyPlayed: [],
                  mostPlayed: []
                } : {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
                  totalGames: 0,
                  totalPlaytime: 0,
                  recentlyPlayed: [],
                  mostPlayed: []
                }
              }
              onProfileUpdate={() => {}}
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Friends Content */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-8 min-h-[800px]">
              {/* Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 bg-gray-950/80 backdrop-blur-md pt-4 pb-6"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Find Friends
                  </h2>
                </div>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      type="text"
                      placeholder="Search users by username..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="pl-10 pr-10 h-12 bg-gray-900/50 border-gray-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="absolute w-full mt-2 p-3 bg-gray-900/90 border-gray-800 backdrop-blur-xl z-50 rounded-xl">
                        <div className="space-y-2">
                          {searchResults.length > 0 ? (
                            searchResults.map((user) => {
                              // Don't show current user in search results
                              if (user.id === profile.id) return null;

                              return (
                                <motion.div
                                  key={user.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="ring-2 ring-purple-500/20 w-10 h-10 group-hover:ring-purple-500/40 transition-all">
                                      <AvatarImage src={user.avatar_url} />
                                      <AvatarFallback className="bg-gray-900 text-purple-400 font-medium">
                                        {user.username?.[0]?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                      {user.username}
                                    </span>
                                  </div>

                                  {(() => {
                                    const friendshipState =
                                      getFriendshipStatus(user);

                                    if (!friendshipState) {
                                      return (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-gray-800/30 border-gray-700/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                                          onClick={async () => {
                                            const toastId = toast.loading(
                                              "Sending friend request..."
                                            );
                                            try {
                                              await sendFriendRequest(user.id);
                                              toast.success(
                                                `Friend request sent to ${user.username}!`,
                                                { id: toastId }
                                              );
                                              searchUsers(searchQuery);
                                            } catch (error) {
                                              toast.error(
                                                error instanceof Error
                                                  ? error.message
                                                  : "Failed to send friend request",
                                                { id: toastId }
                                              );
                                            }
                                          }}
                                        >
                                          <UserPlus className="w-4 h-4 mr-2" />
                                          Add Friend
                                        </Button>
                                      );
                                    }

                                    switch (friendshipState.status) {
                                      case "pending":
                                        return friendshipState.isSender ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-gray-800/30 border-gray-700/30 text-gray-400 cursor-not-allowed"
                                            disabled
                                          >
                                            <Clock className="w-4 h-4 mr-2" />
                                            Request Sent
                                          </Button>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400"
                                            onClick={async () => {
                                              const toastId = toast.loading(
                                                "Accepting friend request..."
                                              );
                                              try {
                                                await sendFriendRequest(
                                                  user.id
                                                );
                                                toast.success(
                                                  "Friend request accepted!",
                                                  { id: toastId }
                                                );
                                                searchUsers(searchQuery);
                                              } catch (error) {
                                                toast.error(
                                                  "Failed to accept friend request",
                                                  { id: toastId }
                                                );
                                              }
                                            }}
                                          >
                                            <Check className="w-4 h-4 mr-2" />
                                            Accept Request
                                          </Button>
                                        );

                                      case "accepted":
                                        return (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-green-500/20 border-green-500/30 text-green-400 cursor-not-allowed"
                                            disabled
                                          >
                                            <Users className="w-4 h-4 mr-2" />
                                            Friends
                                          </Button>
                                        );

                                      case "declined":
                                        return (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-gray-800/30 border-gray-700/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                                            onClick={async () => {
                                              const toastId = toast.loading(
                                                "Sending friend request..."
                                              );
                                              try {
                                                await sendFriendRequest(
                                                  user.id
                                                );
                                                toast.success(
                                                  `Friend request sent to ${user.username}!`,
                                                  { id: toastId }
                                                );
                                                searchUsers(searchQuery);
                                              } catch (error) {
                                                toast.error(
                                                  error instanceof Error
                                                    ? error.message
                                                    : "Failed to send friend request",
                                                  { id: toastId }
                                                );
                                              }
                                            }}
                                          >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add Friend
                                          </Button>
                                        );
                                    }
                                  })()}
                                </motion.div>
                              );
                            })
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center justify-center py-8 text-center"
                            >
                              <UserX className="w-12 h-12 text-gray-500 mb-3" />
                              <p className="text-gray-400 font-medium">
                                No users found matching &ldquo;{searchQuery}
                                &rdquo;
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                Try searching with a different username
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Friends List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 pb-16"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    My Friends ({acceptedFriends.length})
                  </h2>
                </div>
                {acceptedFriends.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="p-8 bg-gray-900/50 border-gray-800 backdrop-blur-xl rounded-xl">
                      <div className="text-center space-y-4">
                        <div className="relative w-20 h-20 mx-auto">
                          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
                          <Users className="w-20 h-20 text-purple-400 mx-auto relative" />
                          <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white mb-2">
                            No friends added yet
                          </p>
                          <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                            Search for users above to add them as friends and
                            start building your gaming community!
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {acceptedFriends.map((friend, index: number) => {
                      const onlineStatus: OnlineStatus =
                        friend.online_status || "offline";
                      return (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={`/profile/${friend.id}`}
                            className="block group"
                          >
                            <Card className="p-5 bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-800/70 hover:border-purple-500/30 transition-all duration-300 rounded-xl">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-500/30 transition-all" />
                                  <Avatar className="ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all w-14 h-14 relative">
                                    <AvatarImage src={friend.avatar_url} />
                                    <AvatarFallback className="bg-gray-900 text-purple-400 font-medium">
                                      {friend.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors">
                                    {friend.username}
                                  </h3>
                                  <div className="flex items-center gap-3">
                                    <p
                                      className={cn(
                                        "text-sm flex items-center gap-1.5",
                                        onlineStatus === "online"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          onlineStatus === "online"
                                            ? "bg-green-400"
                                            : "bg-gray-400"
                                        )}
                                      />
                                      {onlineStatus}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                                      <Gamepad className="w-3.5 h-3.5" />
                                      <span>3 games</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
