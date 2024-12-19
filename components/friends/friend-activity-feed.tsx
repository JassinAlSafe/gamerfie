"use client";

import React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Trophy, PlayCircle, CheckCircle, MessageCircle } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../ui/button";
import { useFriendsStore } from "../../stores/useFriendsStore";
import { ActivityType } from "../../types/friend";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
};

export function FriendActivityFeed() {
  const {
    activities,
    isLoadingActivities,
    fetchActivities,
    loadMoreActivities,
  } = useFriendsStore();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (isLoadingActivities && !activities.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Friend Activity</h2>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
          >
            <Avatar>
              <AvatarImage src={activity.user.avatar_url} />
              <AvatarFallback>
                {activity.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activity.user.id}`}
                  className="font-medium hover:underline"
                >
                  {activity.user.username}
                </Link>
                {activityIcons[activity.activity_type]}
                <Link
                  href={`/game/${activity.game.id}`}
                  className="font-medium text-purple-400 hover:underline truncate"
                >
                  {activity.game.name}
                </Link>
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>

              {activity.details && activity.activity_type === "achievement" && (
                <p className="mt-2 text-sm">
                  🏆 Unlocked: {activity.details.name}
                </p>
              )}

              {activity.details && activity.activity_type === "review" && (
                <p className="mt-2 text-sm">&ldquo;{activity.details.comment}&rdquo;</p>
              )}
            </div>

            {activity.game.cover_url && (
              <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={activity.game.cover_url}
                  alt={activity.game.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {activities.length > 0 && (
        <div className="text-center">
          <Button
            onClick={() => loadMoreActivities()}
            variant="outline"
            disabled={isLoadingActivities}
          >
            {isLoadingActivities ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
