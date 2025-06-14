"use client";

import React, { memo } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameGrid, GridLayout, GridSize } from "../GameGrid/GameGrid";
import { useGameFetch, GameFetchSource } from "@/hooks/Games/useGameFetch";
import { cn } from "@/lib/utils";

interface GameSectionProps {
  title: string;
  source: GameFetchSource;
  icon?: LucideIcon;
  iconColor?: string;
  layout?: GridLayout;
  size?: GridSize;
  limit?: number;
  playlistId?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
  animated?: boolean;
  priority?: boolean;
}

const ErrorCard = memo(({
  title,
  onRetry,
  source,
}: {
  title: string;
  onRetry: () => void;
  source: GameFetchSource;
}) => (
  <Card className="border-white/10 bg-white/5 p-8">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="text-yellow-500/60 text-4xl">⚠️</div>
      <div>
        <h3 className="text-lg font-semibold text-white">
          {title} Unavailable
        </h3>
        <p className="text-sm text-white/60 mt-1">
          {source === "trending"
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
));

ErrorCard.displayName = "ErrorCard";

export const GameSection = memo(({
  title,
  source,
  icon: Icon,
  iconColor = "text-purple-500",
  layout = "grid",
  size = "lg",
  limit = 12,
  playlistId,
  showViewAll = true,
  viewAllLink,
  className,
  animated = false,
  priority = false,
}: GameSectionProps) => {
  const router = useRouter();
  
  const {
    games,
    isLoading,
    error,
    refetch,
    isEmpty,
  } = useGameFetch({
    source,
    limit,
    playlistId,
  });

  const handleViewAll = () => {
    if (viewAllLink) {
      router.push(viewAllLink);
    } else {
      // Generate default view all link based on source
      const categoryMap = {
        popular: "popular",
        trending: "trending", 
        upcoming: "upcoming",
        recent: "recent",
        classic: "classic",
      };
      
      const category = categoryMap[source as keyof typeof categoryMap] || source;
      const timeRange = source === "upcoming" ? "upcoming" : 
                       source === "trending" ? "trending" : "popular";
      
      router.push(`/all-games?category=${category}&timeRange=${timeRange}`);
    }
  };

  // Show error card if there was an error or no games available after loading
  if ((error || isEmpty) && !isLoading) {
    return <ErrorCard title={title} source={source} onRetry={() => refetch()} />;
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
        error={error?.message || null}
        animated={animated}
        priority={priority}
        emptyMessage={`No ${title.toLowerCase()} available at the moment.`}
      />
    </section>
  );
});

GameSection.displayName = "GameSection";