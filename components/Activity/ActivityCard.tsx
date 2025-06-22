"use client";

import React, { useMemo } from "react";
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
}

export const ActivityCard = React.memo<ActivityCardProps>(({ activity }) => {
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
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg">
      {/* Activity Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${activity.user?.id || "#"}`}
                className="font-medium hover:underline"
              >
                {username}
              </Link>
              {activityIcons[activity.type]}
              <span className="text-gray-400">
                {activityText[activity.type]}
              </span>
              <Link
                href={`/game/${activity.game?.id || "#"}`}
                className="font-medium hover:underline"
              >
                {activity.game?.name || "Unknown Game"}
              </Link>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-400">{formattedDate}</p>
              {activity.type && (
                <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600">
                  {activity.type.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {activity.details?.comment && (
          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg border-l-4 border-purple-500/50">
            <p className="text-sm text-gray-300 italic">
              &ldquo;{activity.details.comment}&rdquo;
            </p>
          </div>
        )}

        {renderAchievementDetails()}
      </div>

      {/* Activity Actions */}
      <div className="border-t border-gray-700/50">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityReactions activity={activity} />
            <ActivityComments activity={activity} />
          </div>
          <ActivityShare activity={activity} />
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-700/50 bg-gray-800/30">
        <ActivityComments activity={activity} showInline={true} />
      </div>
    </div>
  );
});

ActivityCard.displayName = 'ActivityCard';
