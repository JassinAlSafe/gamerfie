"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Gamepad2, UserPlus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Friend } from "@/types/friend";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FriendsGridSectionProps {
  friends: Friend[];
  isLoading: boolean;
}

export const FriendsGridSection = memo(function FriendsGridSection({ friends, isLoading }: FriendsGridSectionProps) {
  const { onlineFriends, offlineFriends } = useMemo(() => {
    const online = friends.filter(friend => friend.online_status === "online");
    const offline = friends.filter(friend => friend.online_status !== "online");
    return { onlineFriends: online, offlineFriends: offline };
  }, [friends]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FriendsGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              My Friends ({friends.length})
            </h2>
            {onlineFriends.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {onlineFriends.length} online now
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Friends Content */}
      {friends.length === 0 ? (
        <EmptyFriendsState />
      ) : (
        <div className="space-y-6">
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h3 className="text-lg font-medium text-foreground">
                  Online ({onlineFriends.length})
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {onlineFriends.map((friend, index) => (
                  <FriendCard key={friend.id} friend={friend} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">
                  Offline ({offlineFriends.length})
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {offlineFriends.map((friend, index) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    index={index + onlineFriends.length}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const FriendCard = memo(function FriendCard({ friend, index }: { friend: Friend; index: number }) {
  const isOnline = friend.online_status === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-5 bg-card/50 border-border/30 hover:bg-card/70 hover:border-purple-500/30 transition-all duration-300 rounded-xl group">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="ring-2 ring-border/20 group-hover:ring-purple-500/30 transition-all w-14 h-14">
              <AvatarImage src={friend.avatar_url} />
              <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                {friend.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                isOnline ? "bg-green-400" : "bg-muted-foreground"
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground group-hover:text-purple-400 transition-colors truncate">
                {friend.username}
              </h3>
              <Link href={`/profile/${friend.id}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  View Profile
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <p
                className={cn(
                  "text-sm flex items-center gap-1.5",
                  isOnline ? "text-green-400" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-green-400" : "bg-muted-foreground"
                  )}
                />
                {isOnline ? "Online" : "Offline"}
              </p>
              
              <span className="w-1 h-1 rounded-full bg-border" />
              
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Gaming</span>
              </p>
            </div>
            
            {friend.display_name && (
              <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                {friend.display_name}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

const EmptyFriendsState = memo(function EmptyFriendsState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-12 bg-card/30 border-border/30 backdrop-blur-sm rounded-2xl text-center">
        <div className="space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-12 h-12 text-purple-400" />
            </div>
            <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">
              No friends added yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start building your gaming community by searching for users above and sending friend requests!
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="w-4 h-4" />
            <span>Use the search above to find friends</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

const FriendsGridSkeleton = memo(function FriendsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 bg-card/30 border-border/30 rounded-xl">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});