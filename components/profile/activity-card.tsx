import React from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ActivityType } from "@/types/activity";
import { FriendActivity } from "@/types/friend";

interface ActivityCardProps {
  activities: FriendActivity[];
  onViewAll: () => void;
  activityIcons: Record<ActivityType, React.ReactNode>;
  activityText: Record<ActivityType, string>;
}

export function ActivityCard({
  activities,
  onViewAll,
  activityIcons,
  activityText,
}: ActivityCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-purple-400 hover:text-purple-300"
        >
          View All
        </Button>
      </div>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {activity.user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {activity.user.username}
                </span>
                {activityIcons[activity.type]}
                <span className="text-gray-400">
                  {activityText[activity.type]}
                </span>
                <span className="text-purple-400">{activity.game.name}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {activity.timestamp
                  ? formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </p>
              {activity.details && activity.type === "achievement" && (
                <p className="mt-2 text-sm text-white">
                  🏆 Unlocked: {activity.details.name}
                </p>
              )}
              {activity.details && activity.type === "review" && (
                <p className="mt-2 text-sm text-white">
                  &ldquo;{activity.details.comment}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-gray-400">No recent activity to show.</p>
        )}
      </div>
    </div>
  );
}
