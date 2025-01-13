"use client";

import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ActivityType, FriendActivity } from "@/types/friend";
import { ActivityReactions } from "./ActivityReactions";
import { ActivityComments } from "./ActivityComments";
import { ActivityShare } from "./ActivityShare";
import { activityIcons, activityText } from "@/lib/activity-constants";

interface ActivityCardProps {
  activity: FriendActivity;
  index?: number;
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const username = activity.user?.username || "Unknown User";
  const avatarUrl = activity.user?.avatar_url;
  const userInitial = username[0].toUpperCase();

  const renderAchievementDetails = () => {
    if (activity.type === "achievement") {
      if (activity.details?.isBatched) {
        return (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-yellow-400">
              🏆 Unlocked {activity.details.achievements.length} achievements:
            </p>
            <div className="pl-4 space-y-1">
              {activity.details.achievements.map(
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
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
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

            <p className="text-sm text-gray-400 mt-1">
              {activity.created_at
                ? format(
                    new Date(activity.created_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )
                : "Recently"}
            </p>
          </div>
        </div>

        {activity.type === "review" && activity.details?.comment && (
          <p className="mt-4 text-sm text-gray-300">
            &ldquo;{activity.details.comment}&rdquo;
          </p>
        )}

        {activity.type !== "review" && activity.details?.comment && (
          <p className="mt-4 text-sm text-gray-300">
            &ldquo;{activity.details.comment}&rdquo;
          </p>
        )}

        {renderAchievementDetails()}
      </div>

      {/* Activity Actions */}
      <div className="border-t border-gray-700/50">
        <div className="p-4 flex items-center gap-2">
          <ActivityReactions activity={activity} />
          <ActivityComments activity={activity} />
          <ActivityShare activity={activity} />
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-700/50 bg-gray-800/30">
        <ActivityComments activity={activity} showInline={true} />
      </div>
    </div>
  );
}
