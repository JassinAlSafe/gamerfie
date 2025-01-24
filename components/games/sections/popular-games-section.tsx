"use client";

import { memo, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "react-error-boundary";
import { Game } from "@/types/game";
import { GameCarousel } from "../carousel/game-carousel";
import { CategorySkeleton } from "../ui/category-skeleton";
import { ErrorDisplay, ErrorFallback } from "../ui/error-display";

interface GameCategoryData {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

interface PopularGamesSectionProps {
  category?: "popular" | "upcoming" | "new";
}

interface PopularGamesData {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "upcoming":
      return {
        title: "Upcoming Games",
        color: "text-purple-500",
        icon: Calendar,
      };
    case "new":
      return {
        title: "New Releases",
        color: "text-yellow-500",
        icon: Sparkles,
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
    const queryClient = useQueryClient();
    const [data, setData] = useState<PopularGamesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Prefetch the next category
    useEffect(() => {
      const categories = ["popular", "upcoming", "new"];
      const currentIndex = categories.indexOf(category);
      const nextCategory = categories[(currentIndex + 1) % categories.length];

      queryClient.prefetchQuery({
        queryKey: ["popularGames", nextCategory],
        queryFn: () => fetchGames(nextCategory),
      });
    }, [category, queryClient]);

    useEffect(() => {
      async function fetchData() {
        try {
          const response = await fetch("/api/games/popular");
          const result = (await response.json()) as PopularGamesData;
          setData(result);
        } catch (error) {
          console.error("Failed to fetch popular games:", error);
        } finally {
          setIsLoading(false);
        }
      }
      void fetchData();
    }, []);

    const fetchGames = async (cat: string): Promise<GameCategoryData> => {
      const response = await fetch(`/api/games/popular?category=${cat}`);
      if (!response.ok) {
        throw new Error("Failed to fetch popular games");
      }
      const data = await response.json();
      return {
        topRated: data.topRated || [],
        newReleases: data.newReleases || [],
        upcoming: data.upcoming || [],
        trending: data.trending || [],
      };
    };

    if (isLoading || !data) {
      return <CategorySkeleton />;
    }

    const games =
      category === "popular"
        ? data.topRated
        : category === "new"
        ? data.newReleases
        : category === "upcoming"
        ? data.upcoming
        : data.trending;

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
