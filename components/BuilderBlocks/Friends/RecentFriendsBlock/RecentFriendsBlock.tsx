
"use client";

import { Block } from "../../Block";
import { Friend } from "@/types/friend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Users, UserPlus, MessageCircle } from "lucide-react";
import { memo } from "react";
import Link from "next/link";

interface RecentFriendsBlockProps {
  friends?: Friend[];
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
  isLoading?: boolean;
}

export const RecentFriendsBlock = memo(function RecentFriendsBlock({
  friends = [],
  className,
  size = "sm",
  isLoading = false,
}: RecentFriendsBlockProps) {
  if (isLoading) {
    return (
      <Block
        size={size}
        className={cn("h-[180px]", className)}
        variant="premium"
        hover={false}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-200/10">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Block>
    );
  }

  if (friends.length === 0) {
    return (
      <Block
        size={size}
        className={cn("h-[180px]", className)}
        variant="premium"
        hover={true}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-200/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Friends
              </h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-3">
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
              <UserPlus className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No friends yet</p>
              <p className="text-xs text-muted-foreground/70">Start connecting with gamers</p>
            </div>
            <Link 
              href="/profile/friends" 
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Find Friends →
            </Link>
          </div>
        </div>
      </Block>
    );
  }

  return (
    <Block
      size={size}
      className={cn("h-[180px]", className)}
      variant="premium"
      hover={true}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-blue-200/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Recent Friends
            </h3>
          </div>
          <span className="text-sm px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
            {friends.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/10 scrollbar-track-transparent">
          <div className="grid gap-0.5 p-2">
            {friends.map((friend, index) => (
              <FriendItem 
                key={friend.id} 
                friend={friend} 
                index={index}
              />
            ))}
          </div>
          
          {/* View All Link */}
          {friends.length >= 3 && (
            <div className="p-2 border-t border-blue-200/10">
              <Link 
                href="/profile/friends" 
                className="flex items-center justify-center gap-1 p-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 rounded-lg transition-all duration-200 font-medium"
              >
                View All Friends
                <MessageCircle className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </Block>
  );
});

// Individual friend item component
const FriendItem = memo(function FriendItem({ 
  friend, 
  index 
}: { 
  friend: Friend; 
  index: number; 
}) {
  return (
    <div
      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 cursor-pointer"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative">
        <Avatar className="h-8 w-8 ring-2 ring-blue-500/20 ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-blue-500/40 group-hover:scale-110">
          <AvatarImage src={friend.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-400 text-sm">
            {friend.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Online status indicator - placeholder for future feature */}
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium truncate text-foreground group-hover:text-blue-400 transition-colors duration-200">
          {friend.username}
        </h4>
        {friend.display_name && (
          <p className="text-xs text-muted-foreground truncate group-hover:text-muted-foreground/80 transition-colors duration-200">
            {friend.display_name}
          </p>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <MessageCircle className="h-3 w-3 text-blue-400" />
      </div>
    </div>
  );
});
