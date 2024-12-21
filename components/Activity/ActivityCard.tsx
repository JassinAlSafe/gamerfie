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

export function ActivityCard({ activity, index = 0 }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
    >
      <Avatar>
        <AvatarImage src={activity.user.avatar_url || undefined} />
        <AvatarFallback>
          {activity.user.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/profile/${activity.user.id}`}
            className="font-medium hover:underline"
          >
            {activity.user.username}
          </Link>
          {activityIcons[activity.type]}
          <span className="text-gray-400">{activityText[activity.type]}</span>
          <Link
            href={`/game/${activity.game.id}`}
            className="font-medium text-purple-400 hover:underline truncate"
          >
            {activity.game.name}
          </Link>
          <Badge variant="secondary" className="ml-auto text-xs">
            {format(new Date(activity.timestamp), "h:mm a")}
          </Badge>
        </div>

        <div className="mt-2">
          {activity.details && activity.type === "achievement" && (
            <p className="text-sm">🏆 Unlocked: {activity.details.name}</p>
          )}

          {activity.details?.comment && (
            <p className="text-sm text-gray-300">
              &ldquo;{activity.details.comment}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-700">
            <ActivityReactions activity={activity} />
            <ActivityComments activity={activity} />
            <ActivityShare activity={activity} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
