"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useFriendRequests } from "@/hooks/use-friend-requests";
import { Friend } from "@/types/friend";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FriendAvatar, FriendRequestCard, SearchResultCard, StatCard, ActionButton } from "@/components/ui/friends";
import LoadingSpinner from "@/components/loadingSpinner";
import toast from "react-hot-toast";
import { 
  Users, 
  Search,
  Gamepad2,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Inbox,
  Send,
  X
} from "lucide-react";

// Main Minimal Social Hub Component
export function SocialHub({ onOpenProfile }: { onOpenProfile?: (userId: string) => void }) {
  const { user } = useAuthUser();
  const { isLoading: authLoading, isInitialized } = useAuthStatus();
  const {
    friends,
    fetchFriends,
    addFriend,
  } = useFriendsStore();

  const {
    sentRequests,
    receivedRequests,
    fetchFriendRequests,
    cancelSentRequest,
    acceptReceivedRequest,
    declineReceivedRequest,
  } = useFriendRequests(user?.id);

  // Optimized state using single object (Next.js 14 pattern)
  const [searchState, setSearchState] = useState({
    query: "",
    results: [] as Friend[],
    isSearching: false
  });
  
  const [activeSection, setActiveSection] = useState<'overview' | 'requests' | 'search'>('overview');
  const supabase = createClient();
  const router = useRouter();

  // Categorized friends
  const categorizedFriends = useMemo(() => {
    const accepted = friends.filter(f => f.status === "accepted");
    return {
      all: accepted,
      online: accepted.filter(f => f.online_status === "online"),
      gaming: accepted.filter(f => f.online_status === "online").slice(0, 3), // Mock gaming status
      recent: accepted.slice(0, 8),
    };
  }, [friends]);

  // Stats
  const stats = useMemo(() => ({
    totalFriends: categorizedFriends.all.length,
    onlineNow: categorizedFriends.online.length,
    gaming: categorizedFriends.gaming.length,
    pendingRequests: receivedRequests.length,
  }), [categorizedFriends, receivedRequests]);

  // Initialize
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user, fetchFriends, fetchFriendRequests]);

  // Optimized search functionality with debouncing (Next.js 14 pattern)
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setSearchState(prev => ({ ...prev, results: [], query }));
      setActiveSection('overview');
      return;
    }

    setActiveSection('search');
    setSearchState(prev => ({ ...prev, isSearching: true, query }));
    
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio") // Specific fields only
        .ilike("username", `%${query}%`)
        .neq("id", user.id)
        .limit(10);

      if (error) throw error;

      const transformedResults: Friend[] = (profilesData || []).map(profile => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        status: null as any,
        sender_id: null as any,
        online_status: "offline" as const,
      }));

      setSearchState(prev => ({ 
        ...prev, 
        results: transformedResults, 
        isSearching: false 
      }));
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
      setSearchState(prev => ({ ...prev, isSearching: false }));
    }
  }, [user, supabase]);

  // Actions
  // Optimized actions with better error handling (Next.js 14 pattern)
  const handleSendRequest = useCallback(async (friendId: string) => {
    try {
      await addFriend({ friendId });
      toast.success("Friend request sent!");
      searchUsers(searchState.query);
    } catch (error) {
      console.error("Friend request error:", error);
      toast.error("Failed to send friend request");
    }
  }, [addFriend, searchUsers, searchState.query]);

  const handleViewProfile = (userId: string) => {
    if (onOpenProfile) {
      onOpenProfile(userId);
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  const handleRefresh = () => {
    fetchFriends();
    fetchFriendRequests();
    toast.success("Refreshed!");
  };

  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Social Hub</h1>
              <p className="text-gray-400 mt-1">Connect and play with {stats.totalFriends} friends</p>
            </div>
            <ActionButton
              onClick={handleRefresh}
              color="purple"
              icon={<RefreshCw />}
            >
              Refresh
            </ActionButton>
          </div>

          {/* Minimal Stats Row */}
          <div className="flex gap-8 mb-6">
            <StatCard 
              value={stats.totalFriends} 
              label="Friends" 
              color="default" 
            />
            <StatCard 
              value={stats.onlineNow} 
              label="Online" 
              color="green" 
            />
            <StatCard 
              value={stats.gaming} 
              label="Gaming" 
              color="blue" 
            />
            <StatCard 
              value={stats.pendingRequests} 
              label="Requests" 
              color="amber"
              onClick={() => setActiveSection('requests')}
            />
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchState.query}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchState(prev => ({ ...prev, query: newQuery }));
                searchUsers(newQuery);
              }}
              placeholder="Search for friends by username..."
              className="pl-10 bg-gray-900/50 border-gray-700/50 focus:border-purple-500 text-white h-12"
            />
          </div>
        </motion.div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {activeSection === 'search' && searchState.results.length > 0 && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                Search Results ({searchState.results.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchState.results.map(user => (
                  <SearchResultCard
                    key={user.id}
                    user={user}
                    onSendRequest={handleSendRequest}
                    onViewProfile={handleViewProfile}
                    variant="compact"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Actions */}
              <div className="flex gap-4">
                <Card 
                  className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group flex-1"
                  onClick={() => setActiveSection('requests')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                          Pending Requests
                        </h4>
                        <p className="text-sm text-gray-400">
                          {receivedRequests.length} received, {sentRequests.length} sent
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-400">{stats.pendingRequests}</span>
                        <ArrowUpRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gaming Friends */}
              {categorizedFriends.gaming.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Currently Gaming</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {categorizedFriends.gaming.map((friend, index) => (
                      <FriendAvatar
                        key={friend.id}
                        friend={{...friend, currentGame: "Cyberpunk 2077"}}
                        onViewProfile={handleViewProfile}
                        index={index}
                        showGameStatus={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Online Friends */}
              {categorizedFriends.online.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Online Now</h3>
                    </div>
                    {categorizedFriends.online.length > 8 && (
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        icon={<ArrowUpRight />}
                        iconPosition="right"
                      >
                        View all {categorizedFriends.online.length}
                      </ActionButton>
                    )}
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {categorizedFriends.online.slice(0, 8).map((friend, index) => (
                      <FriendAvatar
                        key={friend.id}
                        friend={friend}
                        onViewProfile={handleViewProfile}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Friends */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">All Friends</h3>
                  </div>
                  {categorizedFriends.all.length > 12 && (
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      icon={<ArrowUpRight />}
                      iconPosition="right"
                    >
                      View all {categorizedFriends.all.length}
                    </ActionButton>
                  )}
                </div>
                
                {categorizedFriends.all.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {categorizedFriends.all.slice(0, 20).map((friend, index) => (
                      <FriendAvatar
                        key={friend.id}
                        friend={friend}
                        onViewProfile={handleViewProfile}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-900/30 border-gray-700/30">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-white font-medium mb-2">No friends yet</h4>
                      <p className="text-gray-400 text-sm mb-4">Search above to find and connect with other gamers</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friend Requests Modal/Section */}
        <AnimatePresence>
          {activeSection === 'requests' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveSection('overview')}
            >
              <Card 
                className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Friend Requests</h3>
                    <ActionButton
                      variant="ghost"
                      onClick={() => setActiveSection('overview')}
                      icon={<X />}
                      className="text-gray-400 hover:text-white"
                    />
                  </div>

                  <div className="space-y-6 overflow-y-auto max-h-96">
                    {/* Received Requests */}
                    {receivedRequests.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <Inbox className="w-4 h-4 text-green-400" />
                          Received ({receivedRequests.length})
                        </h4>
                        {receivedRequests.map(request => (
                          <FriendRequestCard
                            key={request.id}
                            request={request}
                            type="received"
                            onAccept={acceptReceivedRequest}
                            onDecline={declineReceivedRequest}
                          />
                        ))}
                      </div>
                    )}

                    {/* Sent Requests */}
                    {sentRequests.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <Send className="w-4 h-4 text-amber-400" />
                          Sent ({sentRequests.length})
                        </h4>
                        {sentRequests.map(request => (
                          <FriendRequestCard
                            key={request.id}
                            request={request}
                            type="sent"
                            onCancel={cancelSentRequest}
                          />
                        ))}
                      </div>
                    )}

                    {receivedRequests.length === 0 && sentRequests.length === 0 && (
                      <div className="text-center py-8">
                        <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No pending friend requests</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}