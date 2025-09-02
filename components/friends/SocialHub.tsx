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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/loadingSpinner";
import toast from "react-hot-toast";
import { 
  Users, 
  UserPlus, 
  Search,
  Clock, 
  Check, 
  X, 
  Gamepad2,
  MessageCircle,
  Activity,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Inbox,
  Send
} from "lucide-react";

// Minimal Friend Avatar for Social Hub
function MinimalFriendAvatar({ 
  friend, 
  onViewProfile,
  index = 0,
  showGameStatus = false
}: { 
  friend: Friend & { currentGame?: string; lastSeen?: string };
  onViewProfile: (id: string) => void;
  index?: number;
  showGameStatus?: boolean;
}) {
  const getStatusColor = () => {
    if (friend.currentGame) return "ring-blue-500";
    if (friend.online_status === "online") return "ring-green-500";
    return "ring-gray-600";
  };

  const getStatusBadge = () => {
    if (friend.currentGame) return (
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <Gamepad2 className="w-3 h-3 text-white" />
      </div>
    );
    if (friend.online_status === "online") return (
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
    );
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={() => onViewProfile(friend.id)}
    >
      <div className={`relative p-1 rounded-full transition-all duration-300 ring-2 ${getStatusColor()} group-hover:ring-purple-400`}>
        <Avatar className="w-16 h-16 transition-transform duration-300 group-hover:scale-105">
          <AvatarImage src={friend.avatar_url} alt={friend.username} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-semibold">
            {friend.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {getStatusBadge()}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400 group-hover:text-white transition-colors truncate max-w-[80px]">
          {friend.display_name?.split(' ')[0] || friend.username}
        </p>
        {showGameStatus && friend.currentGame && (
          <p className="text-xs text-blue-400 truncate max-w-[80px]">
            Playing
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Minimal Request Card
function MinimalRequestCard({
  request,
  type,
  onAccept,
  onDecline,
  onCancel
}: {
  request: any;
  type: 'received' | 'sent';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700/30 hover:border-gray-600/40 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={request.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            {request.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-white">{request.username}</p>
          <p className="text-xs text-gray-400">
            {type === 'received' ? 'Wants to be friends' : 'Request pending'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        {type === 'received' ? (
          <>
            <Button
              size="sm"
              onClick={() => onAccept?.(request.id)}
              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline?.(request.id)}
              className="h-8 w-8 p-0 border-gray-600 hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel?.(request.id)}
            className="h-8 px-3 border-gray-600 hover:bg-red-500/20 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Main Minimal Social Hub Component
export function SocialHub({ onOpenProfile }: { onOpenProfile?: (userId: string) => void }) {
  const { user } = useAuthUser();
  const { isLoading: authLoading, isInitialized } = useAuthStatus();
  const {
    friends,
    fetchFriends,
    addFriend,
    isLoading: friendsLoading,
  } = useFriendsStore();

  const {
    sentRequests,
    receivedRequests,
    isLoading: requestsLoading,
    fetchFriendRequests,
    cancelSentRequest,
    acceptReceivedRequest,
    declineReceivedRequest,
  } = useFriendRequests(user?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  // Search functionality
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      setActiveSection('overview');
      return;
    }

    setActiveSection('search');
    setIsSearching(true);
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .neq("id", user.id)
        .limit(10);

      if (error) throw error;

      const transformedResults = (profilesData || []).map(profile => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        status: null as any,
        sender_id: null as any,
        online_status: "offline" as const,
      }));

      setSearchResults(transformedResults);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  }, [user, supabase]);

  // Actions
  const handleSendRequest = async (friendId: string) => {
    try {
      await addFriend({ friendId });
      toast.success("Friend request sent!");
      searchUsers(searchQuery);
    } catch (error) {
      toast.error("Failed to send friend request");
    }
  };

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
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Minimal Stats Row */}
          <div className="flex gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalFriends}</div>
              <div className="text-sm text-gray-400">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.onlineNow}</div>
              <div className="text-sm text-gray-400">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.gaming}</div>
              <div className="text-sm text-gray-400">Gaming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-400">Requests</div>
            </div>
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search for friends by username..."
              className="pl-10 bg-gray-900/50 border-gray-700/50 focus:border-purple-500 text-white h-12"
            />
          </div>
        </motion.div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {activeSection === 'search' && searchResults.length > 0 && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                Search Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                          {user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        {user.bio && <p className="text-xs text-gray-400 truncate">{user.bio}</p>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user.id)}
                      className="bg-purple-600 hover:bg-purple-700 h-8 w-8 p-0"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
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
                      <MinimalFriendAvatar 
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
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        View all {categorizedFriends.online.length}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {categorizedFriends.online.slice(0, 8).map((friend, index) => (
                      <MinimalFriendAvatar 
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
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      View all {categorizedFriends.all.length}
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
                
                {categorizedFriends.all.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {categorizedFriends.all.slice(0, 20).map((friend, index) => (
                      <MinimalFriendAvatar 
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection('overview')}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
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
                          <MinimalRequestCard
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
                          <MinimalRequestCard
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