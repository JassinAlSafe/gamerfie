import { Flame, TrendingUp, Calendar } from "lucide-react";
import { CategoryOption } from "@/types/game";

export const GAME_CATEGORIES = [
  {
    id: "popular" as CategoryOption,
    label: "Popular Games",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "trending" as CategoryOption,
    label: "Trending Now",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    id: "upcoming" as CategoryOption,
    label: "Coming Soon",
    icon: Calendar,
    color: "text-purple-500",
  },
] as const;

export const CATEGORY_TIME_RANGES = {
  upcoming: "upcoming",
  trending: "trending",
  popular: "popular",
} as const;
