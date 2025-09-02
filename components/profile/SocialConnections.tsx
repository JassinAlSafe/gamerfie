"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/loading-state";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useFriendsPage } from "@/hooks/Profile/use-friends-page";
import Link from "next/link";
import {
  Users,
  Calendar,
  ArrowUpRight,
  Trophy,
  ExternalLink,
  MessageCircle,
  Zap
} from "lucide-react";

// Minimal Friend Avatar for Profile Context
function MinimalFriendAvatar({ 
  friend, 
  onViewProfile,
  index = 0
}: { 
  friend: any;
  onViewProfile: (id: string) => void;
  index?: number;
}) {
  const getStatusColor = () => {
    if (friend.online_status === "online") return "ring-green-500";
    if (friend.online_status === "gaming") return "ring-purple-500";
    return "ring-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
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
        {friend.online_status === "online" && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </div>
      <p className="text-xs text-center text-gray-400 mt-2 group-hover:text-white transition-colors truncate max-w-[80px]">
        {friend.display_name?.split(' ')[0] || friend.username}
      </p>
    </motion.div>
  );
}

// Main Social Connections Component
export function SocialConnections({ 
  onOpenProfile 
}: { 
  onOpenProfile: (userId: string) => void 
}) {
  const {
    profile,
    isLoading: profileLoading,
  } = useProfile();

  const {
    acceptedFriends,
    friendStats,
  } = useFriendsPage();

  // Show only first 8 friends for minimal design
  const displayFriends = acceptedFriends.slice(0, 8);
  const onlineFriends = acceptedFriends.filter(f => f.online_status === "online").slice(0, 6);

  if (profileLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Friends</h2>
          <p className="text-gray-400 mt-1">{friendStats.total} connections in your network</p>
        </div>
        
        <Link href="/friends">
          <Button 
            variant="outline" 
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/50"
          >
            <Users className="w-4 h-4 mr-2" />
            Social Hub
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>

      {/* Minimal Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-8"
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{friendStats.total}</div>
          <div className="text-sm text-gray-400">Friends</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{friendStats.online}</div>
          <div className="text-sm text-gray-400">Online</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">3</div>
          <div className="text-sm text-gray-400">Gaming</div>
        </div>
      </motion.div>

      {/* Online Friends Section */}
      {onlineFriends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Online Now</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {onlineFriends.map((friend, index) => (
              <MinimalFriendAvatar 
                key={friend.id}
                friend={friend}
                onViewProfile={onOpenProfile}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Friends Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Your Network</h3>
          </div>
          {acceptedFriends.length > 8 && (
            <Link href="/friends">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View all {acceptedFriends.length}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
        
        {displayFriends.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {displayFriends.map((friend, index) => (
              <MinimalFriendAvatar 
                key={friend.id}
                friend={friend}
                onViewProfile={onOpenProfile}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900/30 border-gray-700/30">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">No friends yet</h4>
              <p className="text-gray-400 text-sm mb-4">Connect with other gamers to build your network</p>
              <Link href="/friends">
                <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Simple Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        <Card className="bg-gray-900/30 border-gray-700/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">Added 3 new friends this week</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-400">Played co-op with 2 friends</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">Shared 5 game achievements</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Minimal CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <Link href="/friends">
          <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    Manage Your Social Network
                  </h4>
                  <p className="text-sm text-gray-400">
                    Find new friends, manage requests, and discover gaming communities
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}