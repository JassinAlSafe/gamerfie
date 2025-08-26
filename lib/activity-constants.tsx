import { ReactNode } from "react";
import {
  Trophy,
  PlayCircle,
  CheckCircle,
  MessageCircle,
  BookmarkPlus,
  BarChart2,
  Activity,
  Star,
  Plus,
  UserPlus,
  Target,
  FolderPlus,
  Clock,
  Edit,
} from "lucide-react";
import { ActivityType } from "@/types/activity";

export const activityIcons: Record<ActivityType, ReactNode> = {
  // Legacy activity types
  started_playing: <PlayCircle className="w-5 h-5 text-blue-400" />,
  completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  review: <MessageCircle className="w-5 h-5 text-purple-400" />,
  want_to_play: <BookmarkPlus className="w-5 h-5 text-purple-400" />,
  progress: <BarChart2 className="w-5 h-5 text-blue-400" />,
  
  // Enhanced activity types
  game_added: <Plus className="w-5 h-5 text-green-400" />,
  game_status_updated: <Activity className="w-5 h-5 text-blue-400" />,
  achievement_unlocked: <Trophy className="w-5 h-5 text-yellow-400" />,
  game_completed: <CheckCircle className="w-5 h-5 text-green-400" />,
  review_added: <Star className="w-5 h-5 text-purple-400" />,
  review_updated: <Edit className="w-5 h-5 text-purple-400" />,
  friend_added: <UserPlus className="w-5 h-5 text-green-400" />,
  challenge_joined: <Target className="w-5 h-5 text-orange-400" />,
  challenge_completed: <Trophy className="w-5 h-5 text-yellow-400" />,
  collection_created: <FolderPlus className="w-5 h-5 text-blue-400" />,
  game_session_completed: <Clock className="w-5 h-5 text-green-400" />,
};

export const activityText: Record<ActivityType, string> = {
  // Legacy activity types
  started_playing: "started playing",
  completed: "completed",
  achievement: "unlocked an achievement in",
  review: "reviewed",
  want_to_play: "wants to play",
  progress: "made progress in",
  
  // Enhanced activity types
  game_added: "added",
  game_status_updated: "updated status for",
  achievement_unlocked: "unlocked an achievement in",
  game_completed: "completed",
  review_added: "added a review for",
  review_updated: "updated review for",
  friend_added: "became friends with",
  challenge_joined: "joined challenge",
  challenge_completed: "completed challenge",
  collection_created: "created collection",
  game_session_completed: "finished session for",
};
