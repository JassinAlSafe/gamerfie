"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  PlayCircle,
  CheckCircle,
  MessageCircle,
  Edit2,
  BookmarkPlus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../ui/button";
import { useFriendsStore } from "../../stores/useFriendsStore";
import { ActivityType, FriendActivity } from "../../types/friend";
import { useProfile } from "@/hooks/use-profile";
import { ActivityCommentDialog } from "./activity-comment-dialog";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
  want_to_play: <BookmarkPlus className="w-5 h-5 text-purple-400" />,
};

const activityText: Record<ActivityType, string> = {
  started_playing: "started playing",
  completed: "completed",
  achievement: "unlocked an achievement in",
  review: "reviewed",
  want_to_play: "wants to play",
};

export function FriendActivityFeed() {
  const { profile } = useProfile();
  const {
    activities,
    isLoadingActivities,
    fetchActivities,
    loadMoreActivities,
  } = useFriendsStore();
  const [selectedActivity, setSelectedActivity] =
    useState<FriendActivity | null>(null);

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
      <h2 className="text-2xl font-bold">Recent Activity</h2>

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
                <Link
                  href={`/game/${activity.game.id}`}
                  className="font-medium text-purple-400 hover:underline truncate"
                >
                  {activity.game.name}
                </Link>
                {profile?.id === activity.user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedActivity(activity)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
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

      {selectedActivity && (
        <ActivityCommentDialog
          activity={selectedActivity}
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
