"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/Profile/use-profile";
import { Search, UserPlus, Users, Gamepad } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useUserSearch } from "@/hooks/Profile/use-user-search";
import toast from "react-hot-toast";
import { OnlineStatus } from "@/types/friend";
import { UserSearchDropdown } from "@/components/friends/UserSearchDropdown";

export default function ProfileFriendsPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const { addFriend, friends, fetchFriends } = useFriendsStore();
  const { searchResults, isSearching, searchError, searchUsers, clearSearch } =
    useUserSearch();

  // Check session and get user data using secure getUser()
  useEffect(() => {
    const checkSession = async () => {
      try {
        // IMPORTANT: Use getUser() not getSession() for security
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
  }, [supabase, router, fetchFriends]); // Use store fetchFriends

  const sendFriendRequest = async (friendId: string, username: string) => {
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

  const acceptFriendRequest = async (friendId: string) => {
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
  };

  if (profileLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={profileError?.message || "Profile not found"} />
      </div>
    );
  }

  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[280px] sm:h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            stats={
              gameStats
                ? {
                    ...gameStats,
                    totalGames: gameStats.total_played,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
                : {
                    total_played: 0,
                    played_this_year: 0,
                    backlog: 0,
                    totalGames: 0,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
            }
            onProfileUpdate={() => {}}
          />
        </div>
      </div>

      {/* Profile Navigation - Clean, Apple-inspired design */}
      <div className="bg-gray-950/20 backdrop-blur-sm">
        <ProfileNav />
      </div>

      {/* Profile Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Friends
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Search & Friends List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Search Section */}
              <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Search className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                          Find Friends
                        </h3>
                        <p className="text-sm text-gray-400">
                          Search for users to connect with
                        </p>
                      </div>
                    </div>
                  </div>
                  <UserSearchDropdown
                    searchQuery={searchQuery}
                    onSearchChange={(query) => {
                      setSearchQuery(query);
                      searchUsers(query);
                    }}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    searchError={searchError}
                    onSendFriendRequest={sendFriendRequest}
                    onAcceptFriendRequest={acceptFriendRequest}
                    currentUserId={profile.id}
                    onClearSearch={() => {
                      setSearchQuery("");
                      clearSearch();
                    }}
                  />
                </CardContent>
              </Card>

              {/* Friends List */}
              <Card
                className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                          My Friends
                        </h3>
                        <p className="text-sm text-gray-400">
                          {acceptedFriends.length} connections
                        </p>
                      </div>
                    </div>
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
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Friend Suggestions */}
              <Card
                className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                          Quick Actions
                        </h3>
                        <p className="text-sm text-gray-400">
                          Manage your network
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 border border-gray-700/30 rounded-lg bg-gray-800/20">
                      <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <h4 className="text-white font-medium mb-2">
                        Invite Friends
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Share your gaming journey with friends
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        Share Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
