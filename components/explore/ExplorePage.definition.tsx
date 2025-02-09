import { Flame, Calendar, Sparkles } from "lucide-react";

export const GAME_CATEGORIES = [
  {
    id: "popular",
    label: "Popular Games",
    icon: Flame,
    color: "text-orange-500",
    timeRange: "all",
  },
  {
    id: "upcoming",
    label: "Upcoming Games",
    icon: Calendar,
    color: "text-purple-500",
    timeRange: "upcoming",
  },
  {
    id: "recent",
    label: "New Releases",
    icon: Sparkles,
    color: "text-yellow-500",
    timeRange: "new_releases",
  },
] as const;

export type CategoryId = (typeof GAME_CATEGORIES)[number]["id"];
