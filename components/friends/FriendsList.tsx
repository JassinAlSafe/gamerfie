"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Sparkles, Gamepad, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  FriendsListProps, 
  Friend, 
  OnlineStatus 
} from "@/types/friends-system.types";

export const FriendsList: React.FC<FriendsListProps> = React.memo(({
  friends,
  filteredFriends,
  searchQuery,
  friendsFilter,
  onClearFilters,
  onProfileClick,
}) => {
  // Optimized click handler - created once and reused
  const handleFriendClick = useCallback((friendId: string) => {
    if (onProfileClick) {
      onProfileClick(friendId);
    }
  }, [onProfileClick]);
  // Empty friends state
  if (friends.length === 0) {
    return (
      <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up">
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
                  0 connections
                </p>
              </div>
            </div>
          </div>
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
        </CardContent>
      </Card>
    );
  }

  // No filtered results state
  if (filteredFriends.length === 0) {
    return (
      <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up">
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
                  0 of {friends.length} friends
                </p>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 bg-gray-900/50 border-gray-800 backdrop-blur-xl rounded-xl">
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl" />
                  <Search className="w-20 h-20 text-orange-400 mx-auto relative" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white mb-2">
                    No friends found
                  </p>
                  <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                    {searchQuery 
                      ? `No friends match "${searchQuery}". Try a different search term.`
                      : `No ${friendsFilter} friends found. Try adjusting your filters.`
                    }
                  </p>
                </div>
                <Button
                  onClick={onClearFilters}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Friends list
  return (
    <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up">
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
                {filteredFriends.length} of {friends.length} friends
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFriends.map((friend, index) => {
            const onlineStatus: OnlineStatus = friend.online_status || "offline";
            
            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleFriendClick(friend.id)}
                  className="block w-full text-left group focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl"
                >
                  <Card className="p-5 bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-800/70 hover:border-purple-500/30 transition-all duration-300 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-500/30 transition-all" />
                        <Avatar className="ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all w-14 h-14 relative">
                          <AvatarImage src={friend.avatar_url || undefined} />
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
                </button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

FriendsList.displayName = 'FriendsList';