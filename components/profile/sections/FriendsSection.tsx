import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Friend } from "@/types/friend";
import { cn } from "@/lib/utils";

interface FriendsSectionProps {
  friends: Friend[];
}

export const FriendsSection = memo<FriendsSectionProps>(({ friends }) => {
  const hasFriends = friends && friends.length > 0;
  const displayFriends = friends.slice(0, 3);
  const remainingCount = Math.max(0, friends.length - 3);

  return (
    <Card className={cn(
      "glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl",
      "hover:border-gray-600/40 transition-all duration-300 group"
    )}>
      <CardContent className="p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Friends</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasFriends ? `${friends.length} friends` : 'Your network'}
              </p>
            </div>
          </div>
          
          {/* Action button */}
          <Link href="/profile/friends">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "profile-nav-item touch-feedback",
                "text-gray-400 hover:text-white hover:bg-white/10",
                "transition-all duration-200 rounded-lg group/btn"
              )}
            >
              {hasFriends ? (
                <>
                  View All
                  <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Find Friends
                  <UserPlus className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </Link>
        </div>

        {/* Content */}
        {hasFriends ? (
          <div className="space-y-3">
            {displayFriends.map((friend, index) => (
              <div
                key={friend.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl",
                  "hover:bg-white/5 transition-all duration-200 group/friend"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-700/50 group-hover/friend:ring-blue-400/50 transition-all duration-200">
                    {friend.avatar_url ? (
                      <Image
                        src={friend.avatar_url}
                        alt={friend.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white font-medium">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Online status indicator */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900",
                    friend.online_status === "online" ? "bg-green-500" : "bg-gray-500"
                  )} />
                </div>

                {/* Friend info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover/friend:text-blue-300 transition-colors">
                    {friend.display_name || friend.username}
                  </p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className={cn(
                      "text-xs",
                      friend.online_status === "online" ? "text-green-400" : "text-gray-500"
                    )}>
                      {friend.online_status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Link href={`/profile/${friend.id}`}>
                  <div className={cn(
                    "opacity-0 group-hover/friend:opacity-100",
                    "text-xs text-blue-400 hover:text-blue-300",
                    "transition-all duration-200 cursor-pointer"
                  )}>
                    View
                  </div>
                </Link>
              </div>
            ))}

            {/* Show remaining friends count */}
            {remainingCount > 0 && (
              <div className="pt-2 border-t border-gray-700/30">
                <Link href="/profile/friends">
                  <div className="text-center py-2 text-xs text-gray-400 hover:text-gray-300 cursor-pointer transition-colors">
                    +{remainingCount} more friend{remainingCount !== 1 ? 's' : ''}
                  </div>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto">
              <UserPlus className="h-6 w-6 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium tracking-tight">
                Connect with Gamers
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Build your gaming network and share experiences with fellow players.
              </p>
            </div>
            
            {/* Call-to-action */}
            <div className="pt-2">
              <Link href="/profile/friends">
                <div className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Discover friends
                </div>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FriendsSection.displayName = 'FriendsSection';