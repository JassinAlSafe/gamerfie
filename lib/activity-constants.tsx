import { ReactNode } from "react";
import {
  Trophy,
  PlayCircle,
  CheckCircle,
  MessageCircle,
  BookmarkPlus,
  BarChart2,
} from "lucide-react";
import { ActivityType } from "@/types/friend";

export const activityIcons: Record<ActivityType, ReactNode> = {
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
  want_to_play: <BookmarkPlus className="w-5 h-5 text-purple-400" />,
  progress: <BarChart2 className="w-5 h-5 text-blue-400" />,
};

export const activityText: Record<ActivityType, string> = {
  started_playing: "started playing",
  completed: "completed",
  achievement: "unlocked an achievement in",
  review: "reviewed",
  want_to_play: "wants to play",
  progress: "made progress in",
};
