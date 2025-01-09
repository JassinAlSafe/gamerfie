"use client";

import { memo, useEffect } from "react";
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

    const {
      data: categories,
      isLoading,
      error,
      refetch,
    } = useQuery<GameCategoryData, Error>({
      queryKey: ["popularGames", category],
      queryFn: () => fetchGames(category),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    });

    if (isLoading) {
      return <CategorySkeleton />;
    }

    if (error) {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ErrorDisplay
            message={
              error instanceof Error ? error.message : "Failed to load games"
            }
            onRetry={() => refetch()}
          />
        </ErrorBoundary>
      );
    }

    if (!categories) {
      return (
        <div className="text-center py-12 text-gray-400">
          <p>No games found at the moment.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Refresh
          </Button>
        </div>
      );
    }

    const games =
      category === "popular"
        ? categories.topRated
        : category === "new"
        ? categories.newReleases
        : category === "upcoming"
        ? categories.upcoming
        : categories.trending;

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
