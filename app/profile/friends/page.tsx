"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/use-profile";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Users, X, Gamepad, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  status?: string;
}

interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friend: Friend;
}

export default function ProfileFriendsPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

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
        fetchFriends(user.id);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionLoading(false);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router]);

  const fetchFriends = async (userId: string) => {
    try {
      // First, get the friend relationships
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "accepted");

      if (friendsError) throw friendsError;
      if (!friendsData) return;

      // Then, get the profile information for each friend
      const friendProfiles = await Promise.all(
        friendsData.map(async (friend) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", friend.friend_id)
            .single();

          return {
            ...friend,
            friend: profileData,
          };
        })
      );

      setFriends(friendProfiles);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase.from("friends").insert([
        {
          user_id: user.id,
          friend_id: friendId,
          status: "pending",
        },
      ]);

      if (error) throw error;
      // Refresh search results
      searchUsers(searchQuery);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
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
                gameStats ?? {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
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
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="absolute w-full mt-2 p-3 bg-gray-900/90 border-gray-800 backdrop-blur-xl z-50 rounded-xl">
                        <div className="space-y-2">
                          {searchResults.map((user) => (
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gray-800/30 border-gray-700/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                                onClick={() => sendFriendRequest(user.id)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friend
                              </Button>
                            </motion.div>
                          ))}
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
                    My Friends ({friends.length})
                  </h2>
                </div>
                {friends.length === 0 ? (
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
                    {friends.map(({ friend }, index) => (
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
                                      friend.status === "online"
                                        ? "text-green-400"
                                        : "text-gray-400"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        friend.status === "online"
                                          ? "bg-green-400"
                                          : "bg-gray-400"
                                      )}
                                    />
                                    {friend.status || "Offline"}
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
                    ))}
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
