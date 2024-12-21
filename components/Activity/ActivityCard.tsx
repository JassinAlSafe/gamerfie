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

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
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
            <span className="text-gray-400">{activityText[activity.type]}</span>
            <Link
              href={`/game/${activity.game?.id || "#"}`}
              className="font-medium hover:underline"
            >
              {activity.game?.name || "Unknown Game"}
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            {activity.created_at
              ? format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")
              : "Recently"}
          </p>

          {activity.details?.comment && (
            <p className="mt-2 text-sm text-gray-300">
              &ldquo;{activity.details.comment}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <ActivityReactions activity={activity} />
        <ActivityComments activity={activity} />
        <ActivityShare activity={activity} />
      </div>
    </div>
  );
}
