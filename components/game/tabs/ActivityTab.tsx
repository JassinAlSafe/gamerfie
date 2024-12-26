"use client";

import React from "react";
import Image from "next/image";
import { Activity, Trophy, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import {
  formatTimestamp,
  formatPlaytime,
  formatStatus,
} from "@/lib/formatters";

interface ActivityTabProps {
  gameId: string;
  activities: {
    data: GameActivity[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
}

interface GameActivity {
  id: string;
  type:
    | "game_status_updated"
    | "achievement_unlocked"
    | "game_completed"
    | "review_added";
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  metadata: {
    status?: string;
    achievement?: {
      name: string;
      icon_url?: string;
    };
    rating?: number;
    review?: string;
    playtime?: number;
  };
  created_at: string;
}

export function ActivityTab({ gameId, activities }: ActivityTabProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  if (activities.loading && !activities.data.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!activities.data.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.data.map((activity) => (
        <div
          key={activity.id}
          className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40"
        >
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {activity.user.avatar_url ? (
                <Image
                  src={activity.user.avatar_url}
                  alt={activity.user.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg text-gray-400">
                    {activity.user.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-white">
                  {activity.user.username}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">
                  {formatTimestamp(activity.created_at)}
                </span>
              </div>

              {/* Activity Type Specific Content */}
              {activity.type === "achievement_unlocked" && (
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">
                    Unlocked achievement:{" "}
                    <span className="text-white font-medium">
                      {activity.metadata.achievement?.name}
                    </span>
                  </span>
                </div>
              )}

              {activity.type === "game_completed" && (
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">
                    Completed the game in{" "}
                    <span className="text-white font-medium">
                      {formatPlaytime(activity.metadata.playtime || 0)}
                    </span>
                  </span>
                </div>
              )}

              {activity.type === "review_added" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">
                      Rated {activity.metadata.rating}/10
                    </span>
                  </div>
                  {activity.metadata.review && (
                    <p className="text-gray-300 mt-2">
                      {activity.metadata.review}
                    </p>
                  )}
                </div>
              )}

              {activity.type === "game_status_updated" && (
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">
                    Status updated to{" "}
                    <span className="text-white font-medium">
                      {formatStatus(activity.metadata.status || "")}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {activities.hasMore && (
        <div className="text-center">
          <Button
            onClick={activities.loadMore}
            variant="outline"
            disabled={activities.loading}
            className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
          >
            {activities.loading ? <LoadingSpinner size="sm" /> : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
