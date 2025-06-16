"use client";

import React, { memo } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameGrid, GridLayout, GridSize } from "../GameGrid/GameGrid";
import { Game } from "@/types";
import { cn } from "@/lib/utils";

interface OptimizedGameSectionProps {
  title: string;
  games: Game[];
  icon?: LucideIcon;
  iconColor?: string;
  layout?: GridLayout;
  size?: GridSize;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
  animated?: boolean;
  priority?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Error Card Component
const ErrorCard = memo(
  ({ title, onRetry }: { title: string; onRetry?: () => void }) => (
    <Card className="p-8 text-center border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto">
          <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Unable to load {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            We're having trouble loading this content. Please try again.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="gap-2 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
);

ErrorCard.displayName = "ErrorCard";

export const OptimizedGameSection = memo(
  ({
    title,
    games,
    icon: Icon,
    iconColor = "text-purple-500",
    layout = "grid",
    size = "lg",
    showViewAll = true,
    viewAllLink,
    className,
    animated = false,
    priority = false,
    isLoading = false,
    error = null,
    onRetry,
  }: OptimizedGameSectionProps) => {
    const router = useRouter();

    const handleViewAll = () => {
      if (viewAllLink) {
        router.push(viewAllLink);
      } else {
        // Generate default view all link based on title
        const titleToCategory = {
          "Popular Games": "popular",
          "Trending Now": "trending",
          "Upcoming Releases": "upcoming",
          "Recent Releases": "recent",
          "Classic Games": "classic",
        };

        const category =
          titleToCategory[title as keyof typeof titleToCategory] || "popular";
        router.push(`/all-games?category=${category}`);
      }
    };

    // Show error card if there was an error
    if (error && !isLoading) {
      return (
        <section className={cn("space-y-8", className)}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className={cn("h-7 w-7", iconColor)} />}
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
          <ErrorCard title={title} onRetry={onRetry} />
        </section>
      );
    }

    // Show empty state if no games and not loading
    if (!isLoading && games.length === 0) {
      return (
        <section className={cn("space-y-8", className)}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className={cn("h-7 w-7", iconColor)} />}
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
          <Card className="p-8 text-center border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                {Icon && <Icon className="w-8 h-8 text-gray-400" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No {title.toLowerCase()} available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check back later for new content.
                </p>
              </div>
            </div>
          </Card>
        </section>
      );
    }

    return (
      <section className={cn("space-y-8", className)}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={cn("h-7 w-7", iconColor)} />}
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>

          {showViewAll && !isLoading && games.length > 0 && (
            <Button
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
              onClick={handleViewAll}
            >
              View All
            </Button>
          )}
        </div>

        {/* Games Grid */}
        <GameGrid
          games={games}
          layout={layout}
          size={size}
          loading={isLoading}
          error={error}
          animated={animated}
          priority={priority}
          emptyMessage={`No ${title.toLowerCase()} available at the moment.`}
        />
      </section>
    );
  }
);

OptimizedGameSection.displayName = "OptimizedGameSection";
