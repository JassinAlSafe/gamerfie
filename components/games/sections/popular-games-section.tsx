"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  TrendingUp,
  Flame,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryOption } from "@/types";
import { GameCarousel } from "../carousel/game-carousel";
import { CategorySkeleton } from "../ui/category-skeleton";
import { Card } from "@/components/ui/card";

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

function ErrorCard({
  category,
  onRetry,
}: {
  category: CategoryOption;
  onRetry: () => void;
}) {
  const { title } = getCategoryLabel(category);

  return (
    <Card className="border-white/10 bg-white/5 p-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500/60" />
        <div>
          <h3 className="text-lg font-semibold text-white">
            {title} Unavailable
          </h3>
          <p className="text-sm text-white/60 mt-1">
            {category === "trending"
              ? "Trending games are temporarily unavailable. Our services may be experiencing issues."
              : `${title} are temporarily unavailable. Please try again later.`}
          </p>
        </div>
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
      </div>
    </Card>
  );
}

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
        console.log(`Fetching ${category} games...`);

        const response = await fetch(`/api/games/${category}?limit=12`);
        if (!response.ok) {
          console.error(
            `Failed to fetch ${category} games:`,
            response.status,
            response.statusText
          );
          throw new Error(`Failed to fetch ${category} games`);
        }

        const data = await response.json();
        console.log(`${category} games response:`, data);

        // Handle different response formats:
        // Popular: returns array directly
        // Trending/Upcoming: returns {games: [...]}
        const games = Array.isArray(data) ? data : data.games || [];

        // If we get an error message in the response, handle it gracefully
        if (data.error && games.length === 0) {
          console.warn(`${category} games service unavailable:`, data.error);
          // Don't throw, just return empty array to show error state
          return [];
        }

        console.log(`Successfully fetched ${games.length} ${category} games`);
        return games;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry more than 2 times
        if (failureCount >= 2) return false;

        // Don't retry on 404 or 403 errors
        if (error instanceof Error && error.message.includes("404"))
          return false;
        if (error instanceof Error && error.message.includes("403"))
          return false;

        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    if (isLoading) return <CategorySkeleton />;

    // Show error card if there was an error or no games available
    if (error || !games || games.length === 0) {
      return <ErrorCard category={category} onRetry={() => refetch()} />;
    }

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
