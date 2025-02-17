"use client";

import { Block } from "../../Block";
import { cn } from "@/lib/utils";
import {
  Activity,
  Trophy,
  Gamepad2,
  BarChart3,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Activity as ActivityType,
  ActivityType as ActivityTypeEnum,
} from "@/types/activity";

interface RecentActivityBlockProps {
  activities?: ActivityType[];
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
}

function getActivityIcon(type: ActivityTypeEnum) {
  const iconClasses =
    "h-4 w-4 transition-transform group-hover:scale-110 shrink-0";

  switch (type) {
    case "progress":
      return <BarChart3 className={cn(iconClasses, "text-blue-400")} />;
    case "review":
      return <MessageSquare className={cn(iconClasses, "text-purple-400")} />;
    case "completed":
      return <Trophy className={cn(iconClasses, "text-green-400")} />;
    case "want_to_play":
      return <Bookmark className={cn(iconClasses, "text-violet-400")} />;
    case "started_playing":
      return <Gamepad2 className={cn(iconClasses, "text-blue-400")} />;
    case "achievement_unlocked":
      return <Trophy className={cn(iconClasses, "text-yellow-400")} />;
    default:
      return <Activity className={cn(iconClasses, "text-blue-400")} />;
  }
}

function getActivityText(type: ActivityTypeEnum) {
  switch (type) {
    case "progress":
      return "made progress in";
    case "review":
      return "reviewed";
    case "completed":
      return "completed";
    case "want_to_play":
      return "wants to play";
    case "started_playing":
      return "started playing";
    case "achievement_unlocked":
      return "unlocked achievement in";
    default:
      return "updated";
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
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
          <div className="flex items-center justify-between p-4 border-b border-green-200/10">
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-200/10">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Recent Activity
            </h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 font-medium hover:bg-green-500/15 transition-colors cursor-default">
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
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-500/5 transition-all duration-200 cursor-pointer"
              >
                <Avatar className="h-8 w-8 ring-2 ring-green-500/20 ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-green-500/30 shrink-0">
                  <AvatarImage src={activity.user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-sm">
                    {activity.user?.username?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate group-hover:text-green-500 transition-colors">
                      {activity.user?.username ?? "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getActivityIcon(activity.type)}
                    <p className="text-sm text-muted-foreground truncate group-hover:text-muted-foreground/90 transition-colors">
                      <span className="text-muted-foreground/90">
                        {getActivityText(activity.type)}
                      </span>{" "}
                      <span className="text-purple-400 font-medium">
                        {activity.game?.name ?? "Unknown Game"}
                      </span>
                      {activity.details?.comment && (
                        <span className="text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
                          {" "}
                          • {activity.details.comment}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Block>
  );
}
