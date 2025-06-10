import { Flame, TrendingUp, CalendarDays } from "lucide-react";

export const GAME_CATEGORIES = [
  {
    id: "popular",
    label: "Popular Games",
    icon: Flame,
    color: "text-orange-500",
    timeRange: "all",
  },
  {
    id: "trending",
    label: "Recently Trending",
    icon: TrendingUp,
    color: "text-green-500",
    timeRange: "trending",
  },
  {
    id: "upcoming",
    label: "Upcoming Games",
    icon: CalendarDays,
    color: "text-purple-500",
    timeRange: "upcoming",
  },
] as const;

export type CategoryId = (typeof GAME_CATEGORIES)[number]["id"];
