import React from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Trophy, PlayCircle, CheckCircle, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityType } from "@/types/friend";
import { motion } from "framer-motion";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
};

interface GameActivity {
  id: string;
  type: ActivityType;
  details: any;
  timestamp: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface GameActivitiesProps {
  activities: GameActivity[];
}

export function GameActivities({ activities }: GameActivitiesProps) {
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
                {activity.type === "started_playing" && "started playing"}
                {activity.type === "completed" && "completed"}
                {activity.type === "achievement" && "unlocked an achievement"}
                {activity.type === "review" && "reviewed"}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
              })}
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
          </div>
        </motion.div>
      ))}
    </div>
  );
}
