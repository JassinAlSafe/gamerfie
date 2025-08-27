"use client";

import { Block } from "../../Block";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity as ActivityType,
  ActivityType as ActivityTypeEnum,
  ActivityDetails,
} from "@/types/activity";

interface RecentActivityBlockProps {
  activities?: ActivityType[];
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
}


function formatActivityType(type: ActivityTypeEnum | undefined | null): string {
  // Handle undefined/null/invalid types safely
  if (!type || typeof type !== "string") {
    return "posted";
  }

  switch (type) {
    case "want_to_play":
      return "wants to play";
    case "started_playing":
      return "started playing";
    case "completed":
      return "completed";
    case "review":
      return "reviewed";
    case "progress":
      return "made progress in";
    case "achievement_unlocked":
      return "unlocked achievement in";
    case "game_completed":
      return "completed";
    case "review_added":
      return "reviewed";
    case "achievement":
      return "earned achievement in";
    case "game_status_updated":
      return "updated";
    default:
      return "posted about";
  }
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "recently";
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "recently";
  }
}

function getActivityDetails(details: ActivityDetails | undefined) {
  if (!details) return null;

  const elements: React.ReactNode[] = [];

  if (details.progress !== undefined) {
    elements.push(
      <span key="progress">
        Progress: {details.progress}%
      </span>
    );
  }

  if (details.achievement) {
    elements.push(
      <span key="achievement">
        Achievement: {details.achievement}
      </span>
    );
  }

  if (details.achievements?.length) {
    elements.push(
      <span key="achievements">
        {details.achievements.length} achievements unlocked
      </span>
    );
  }

  if (details.comment) {
    elements.push(
      <span key="comment">
        {details.comment}
      </span>
    );
  }

  return elements.length > 0 ? (
    <div className="flex flex-wrap items-center gap-3">{elements}</div>
  ) : null;
}

export function RecentActivityBlock({
  activities = [],
  className,
  size = "sm",
}: RecentActivityBlockProps) {
  if (activities.length === 0) {
    return (
      <Block
        size={size}
        variant="success"
        hover={true}
        className={cn("h-[180px]", className)}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border/10">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </div>
        </div>
      </Block>
    );
  }

  return (
    <Block
      size={size}
      variant="success"
      hover={true}
      className={cn("h-[180px]", className)}
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border/10">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-border/10">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={activity.user?.avatar_url} />
                  <AvatarFallback className="bg-muted text-foreground text-xs">
                    {activity.user?.username?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {activity.user?.username ?? "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatActivityType(activity.type)}{" "}
                    <span className="font-medium text-foreground">
                      {String(activity.game?.name ?? "Unknown Game")}
                    </span>
                  </p>
                  {activity.details && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {getActivityDetails(activity.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Block>
  );
}
