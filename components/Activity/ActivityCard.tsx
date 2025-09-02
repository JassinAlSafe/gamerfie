"use client";

import React, { useMemo, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendActivity } from "@/types/activity";
import { Badge } from "@/components/ui/badge";

import { ActivityReactions } from "./ActivityReactions";
import { ActivityComments } from "./ActivityComments";
import { ActivityShare } from "./ActivityShare";
import { activityIcons, activityText } from "@/lib/activity-constants";

interface ActivityCardProps {
  activity: FriendActivity;
  onAddReaction?: (activityId: string, emoji: string) => void;
  onAddComment?: (activityId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const ActivityCard = React.memo<ActivityCardProps>(({ 
  activity, 
  onAddReaction, 
  onAddComment, 
  onDeleteComment,
  onProfileClick 
}) => {
  const { username, avatarUrl, userInitial, formattedDate } = useMemo(() => {
    const name = activity.user?.username || "Unknown User";
    const avatar = activity.user?.avatar_url;
    const initial = name[0].toUpperCase();
    const date = activity.created_at
      ? format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")
      : "Recently";
    
    return {
      username: name,
      avatarUrl: avatar,
      userInitial: initial,
      formattedDate: date
    };
  }, [activity.user?.username, activity.user?.avatar_url, activity.created_at]);

  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onProfileClick && activity.user?.id) {
      onProfileClick(activity.user.id);
    }
  }, [onProfileClick, activity.user?.id]);

  const renderAchievementDetails = () => {
    if (activity.type === "achievement") {
      if (activity.details?.isBatched) {
        return (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-yellow-400">
              🏆 Unlocked {activity.details?.achievements?.length || 0}{" "}
              achievements:
            </p>
            <div className="pl-4 space-y-1">
              {activity.details?.achievements?.map(
                (achievement: { name: string }, i: number) => (
                  <p key={i} className="text-sm text-gray-300">
                    • {achievement.name}
                  </p>
                )
              )}
            </div>
          </div>
        );
      } else {
        return (
          <p className="mt-4 text-sm text-yellow-400">
            🏆 Unlocked: {activity.details?.name}
          </p>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/40 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:bg-gray-800/40">
      {/* Activity Header - Improved mobile layout */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <button onClick={handleProfileClick} className="focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-full">
              <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-gray-600/50 hover:border-purple-500/40 transition-colors duration-200 cursor-pointer">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-sm font-semibold text-white">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            {/* Mobile-first responsive activity description */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleProfileClick}
                  className="font-medium text-white hover:text-purple-300 transition-colors duration-200 hover:underline text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-1"
                >
                  {username}
                </button>
                <div className="flex items-center gap-1.5">
                  {activityIcons[activity.type]}
                  <span className="text-gray-400 text-sm">
                    {activityText[activity.type]}
                  </span>
                </div>
              </div>
              <Link
                href={`/game/${activity.game?.id || "#"}`}
                className="font-medium text-purple-300 hover:text-purple-200 transition-colors duration-200 hover:underline text-sm sm:text-base truncate max-w-full sm:max-w-xs"
                title={activity.game?.name || "Unknown Game"}
              >
                {activity.game?.name || "Unknown Game"}
              </Link>
            </div>

            {/* Improved metadata section */}
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-400">{formattedDate}</p>
              {activity.type && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 px-2 py-0.5"
                >
                  {activity.type.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {activity.details?.comment && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-700/20 rounded-lg border-l-4 border-purple-500/50 backdrop-blur-sm">
            <p className="text-sm text-gray-200 italic leading-relaxed">
              &ldquo;{activity.details.comment}&rdquo;
            </p>
          </div>
        )}

        {renderAchievementDetails()}
      </div>

      {/* Activity Actions - Improved mobile layout */}
      <div className="border-t border-gray-700/40">
        <div className="p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <ActivityReactions activity={activity} onAddReaction={onAddReaction} />
            <ActivityComments activity={activity} onAddComment={onAddComment} onDeleteComment={onDeleteComment} />
          </div>
          <ActivityShare activity={activity} />
        </div>
      </div>

      {/* Comments Section - Better spacing */}
      <div className="border-t border-gray-700/40 bg-gray-800/20">
        <ActivityComments 
          activity={activity} 
          showInline={true} 
          onAddComment={onAddComment} 
          onDeleteComment={onDeleteComment} 
        />
      </div>
    </div>
  );
});

ActivityCard.displayName = 'ActivityCard';
