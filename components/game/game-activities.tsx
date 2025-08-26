"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityType } from "@/types/activity";
import { motion } from "framer-motion";
import { useGameActivities } from "@/hooks/Games/use-game-activities";
import { Button } from "@/components/ui/button";

// Import from centralized constants
import { activityIcons, activityText } from "@/lib/activity-constants";

interface GameActivitiesProps {
  gameId: string;
}

export function GameActivities({ gameId }: GameActivitiesProps) {
  const { activities, loading, hasMore, loadMore } = useGameActivities(gameId);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

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
              {activityIcons[activity.type as ActivityType]}
              <span className="text-gray-400">
                {activityText[activity.type as ActivityType]}
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
              <div className="mt-2 text-sm">
                {(activity.details as any).isBatched ? (
                  <>
                    <p>🏆 {(activity.details as any).name}</p>
                    <ul className="mt-1 ml-6 list-disc text-gray-400">
                      {(activity.details as any).achievements?.map(
                        (achievement: { name: string }, i: number) => (
                          <li key={i}>{achievement.name}</li>
                        )
                      )}
                    </ul>
                  </>
                ) : (
                  <p>🏆 Unlocked: {(activity.details as any).name}</p>
                )}
              </div>
            )}

            {activity.details && activity.type === "review" && (
              <p className="mt-2 text-sm">
                &ldquo;{(activity.details as any).comment}&rdquo;
              </p>
            )}

            {(activity.details as any)?.comment &&
              activity.type !== "review" && (
                <p className="mt-2 text-sm text-gray-400">
                  &ldquo;{(activity.details as any).comment}&rdquo;
                </p>
              )}
          </div>
        </motion.div>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
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
