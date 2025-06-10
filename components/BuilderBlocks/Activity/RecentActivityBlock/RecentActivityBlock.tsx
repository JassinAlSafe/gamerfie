"use client";

import { Block } from "../../Block";
import { cn } from "@/lib/utils";
import {
  Activity,
  Trophy,
  Gamepad2,
  LineChart,
  Bookmark,
  Star,
  Medal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

function getActivityIcon(type: ActivityTypeEnum | undefined | null) {
  const iconClasses =
    "h-3.5 w-3.5 transition-transform group-hover:scale-110 shrink-0";

  if (!type) {
    return <Activity className={cn(iconClasses, "text-blue-400")} />;
  }

  switch (type) {
    case "progress":
      return <LineChart className={cn(iconClasses, "text-blue-400")} />;
    case "review":
      return <Star className={cn(iconClasses, "text-amber-400")} />;
    case "completed":
      return <Medal className={cn(iconClasses, "text-green-400")} />;
    case "want_to_play":
      return <Bookmark className={cn(iconClasses, "text-violet-400")} />;
    case "started_playing":
      return <Gamepad2 className={cn(iconClasses, "text-blue-400")} />;
    case "achievement_unlocked":
      return <Trophy className={cn(iconClasses, "text-yellow-400")} />;
    case "game_completed":
      return <Medal className={cn(iconClasses, "text-green-400")} />;
    case "review_added":
      return <Star className={cn(iconClasses, "text-amber-400")} />;
    case "achievement":
      return <Trophy className={cn(iconClasses, "text-yellow-400")} />;
    case "game_status_updated":
      return <Activity className={cn(iconClasses, "text-purple-400")} />;
    default:
      return <Activity className={cn(iconClasses, "text-blue-400")} />;
  }
}

function formatActivityType(type: ActivityTypeEnum | undefined | null): string {
  // Handle undefined/null/invalid types safely
  if (!type || typeof type !== "string") {
    return "Unknown Activity";
  }

  switch (type) {
    case "want_to_play":
      return "Wants To Play";
    case "started_playing":
      return "Started Playing";
    case "completed":
      return "Completed";
    case "review":
      return "Reviewed";
    case "progress":
      return "Made Progress in";
    case "achievement_unlocked":
      return "Unlocked an Achievement in";
    case "game_completed":
      return "Completed";
    case "review_added":
      return "Reviewed";
    case "achievement":
      return "Earned Achievement in";
    case "game_status_updated":
      return "Updated Status for";
    default:
      // Convert any unknown enum values to readable format
      const stringType = String(type);
      return stringType.replace(/_/g, " ");
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
  } catch (error) {
    return "recently";
  }
}

function getActivityDetails(details: ActivityDetails | undefined) {
  if (!details) return null;

  const elements: React.ReactNode[] = [];

  if (details.progress !== undefined) {
    elements.push(
      <span key="progress" className="flex items-center gap-1.5 text-blue-400">
        <LineChart className="h-3 w-3" />
        {details.progress}%
      </span>
    );
  }

  if (details.achievement) {
    elements.push(
      <span
        key="achievement"
        className="flex items-center gap-1.5 text-yellow-400"
      >
        <Trophy className="h-3 w-3" />
        {details.achievement}
      </span>
    );
  }

  if (details.achievements?.length) {
    elements.push(
      <span
        key="achievements"
        className="flex items-center gap-1.5 text-yellow-400"
      >
        <Trophy className="h-3 w-3" />
        {details.achievements.length} achievements
      </span>
    );
  }

  if (details.comment) {
    elements.push(
      <span key="comment" className="text-muted-foreground/70">
        {details.comment}
      </span>
    );
  }

  return elements.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2">{elements}</div>
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
          <div className="flex items-center justify-between p-3 border-b border-green-200/10">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <h3 className="text-lg font-semibold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Recent Activity
              </h3>
            </div>
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
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-green-200/10">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Recent Activity
            </h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium hover:bg-green-500/15 transition-colors cursor-default">
                  {activities.length}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total Recent Activities</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/10 scrollbar-track-transparent hover:scrollbar-thumb-green-500/20">
          <div className="grid gap-0.5 p-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start gap-2 p-2 rounded-lg hover:bg-green-500/5 transition-all duration-200 cursor-pointer"
              >
                <Avatar className="h-6 w-6 ring-1 ring-green-500/20 ring-offset-1 ring-offset-background transition-all duration-200 group-hover:ring-green-500/30 shrink-0">
                  <AvatarImage src={activity.user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-xs">
                    {activity.user?.username?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs truncate group-hover:text-green-500 transition-colors">
                      {activity.user?.username ?? "Unknown User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getActivityIcon(activity.type)}
                    <p className="text-xs text-muted-foreground truncate group-hover:text-muted-foreground/90 transition-colors">
                      <span className="text-muted-foreground/90">
                        {formatActivityType(activity.type)}
                      </span>{" "}
                      <span className="text-emerald-400 font-medium">
                        {String(activity.game?.name ?? "Unknown Game")}
                      </span>
                    </p>
                  </div>
                  {activity.details && (
                    <div className="mt-1 text-[10px]">
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
