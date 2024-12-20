"use client";

import React, { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Trophy, PlayCircle, CheckCircle, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityType } from "@/types/friend";
import { motion } from "framer-motion";
import { useGameActivities } from "@/hooks/use-game-activities";
import { Button } from "@/components/ui/button";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
};

const activityText: Record<ActivityType, string> = {
  started_playing: "started playing",
  completed: "completed",
  achievement: "unlocked an achievement in",
  review: "reviewed",
};

interface GameActivitiesProps {
  gameId: string;
}

export function GameActivities({ gameId }: GameActivitiesProps) {
  const { activities, loading, hasMore, loadMore } = useGameActivities(gameId);

  if (loading && !activities.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!activities.length) {
    return <p className="text-gray-400">No recent activity for this game.</p>;
  }

  return (
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
            <AvatarImage src={activity.user.avatar_url || undefined} />
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
              {activityIcons[activity.type]}
              <span className="text-gray-400">
                {activityText[activity.type]}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              {activity.timestamp
                ? formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })
                : "Just now"}
            </p>

            {activity.details && activity.type === "achievement" && (
              <p className="mt-2 text-sm">
                🏆 Unlocked: {activity.details.name}
              </p>
            )}

            {activity.details && activity.type === "review" && (
              <p className="mt-2 text-sm">
                &ldquo;{activity.details.comment}&rdquo;
              </p>
            )}

            {activity.details?.comment && activity.type !== "review" && (
              <p className="mt-2 text-sm text-gray-400">
                &ldquo;{activity.details.comment}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={() => loadMore()}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
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
