"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryOption } from "@/types";
import { GameCarousel } from "../carousel/game-carousel";
import { CategorySkeleton } from "../ui/category-skeleton";

interface PopularGamesSectionProps {
  category?: CategoryOption;
}

const getCategoryLabel = (category: CategoryOption) => {
  switch (category) {
    case "upcoming":
      return {
        title: "Coming Soon",
        color: "text-purple-500",
        icon: CalendarDays,
      };
    case "trending":
      return {
        title: "Trending Now",
        color: "text-green-500",
        icon: TrendingUp,
      };
    case "popular":
    default:
      return {
        title: "Popular Games",
        color: "text-orange-500",
        icon: Flame,
      };
  }
};

export const PopularGamesSection = memo(
  ({ category = "popular" }: PopularGamesSectionProps) => {
    const {
      data: games,
      isLoading,
      error,
      refetch,
    } = useQuery({
      queryKey: ["games", category],
      queryFn: async () => {
        const response = await fetch(`/api/games/${category}`);
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        const data = await response.json();

        // Handle different response formats:
        // Popular: returns array directly
        // Trending/Upcoming: returns {games: [...]}
        const games = Array.isArray(data) ? data : data.games || [];
        return games;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading) return <CategorySkeleton />;
    if (error) return <Button onClick={() => refetch()}>Retry</Button>;
    if (!games || games.length === 0) return null;

    const { title, color, icon } = getCategoryLabel(category);

    return (
      <GameCarousel
        games={games}
        category={category}
        title={title}
        icon={icon}
        color={color}
      />
    );
  }
);

PopularGamesSection.displayName = "PopularGamesSection";
