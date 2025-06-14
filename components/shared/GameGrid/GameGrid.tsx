"use client";

import React, { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/types";
import { GameCard, GameCardVariant } from "../GameCard/GameCard";
import { cn } from "@/lib/utils";

export type GridLayout = "grid" | "list";
export type GridSize = "sm" | "md" | "lg" | "xl";

interface GameGridProps {
  games: Game[];
  layout?: GridLayout;
  size?: GridSize;
  variant?: GameCardVariant;
  className?: string;
  maxItems?: number;
  animated?: boolean;
  priority?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
}

const gridSizeClasses = {
  sm: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  md: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  lg: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  xl: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6",
};

const LoadingSkeleton = memo(({ layout, size }: { layout: GridLayout; size: GridSize }) => {
  const itemCount = layout === "list" ? 6 : 8;
  
  return (
    <div className={cn(
      layout === "grid" ? `grid gap-4 ${gridSizeClasses[size]}` : "space-y-4"
    )}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-white/5 rounded-lg",
            layout === "list" ? "h-24 flex items-center space-x-4 p-4" : "aspect-[3/4]"
          )}
        >
          {layout === "list" && (
            <>
              <div className="w-16 h-20 bg-white/10 rounded-md flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = "LoadingSkeleton";

const ErrorDisplay = memo(({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-red-400 mb-2">⚠️</div>
    <h3 className="text-lg font-semibold text-white mb-2">Unable to load games</h3>
    <p className="text-white/60 text-sm">{message}</p>
  </div>
));

ErrorDisplay.displayName = "ErrorDisplay";

const EmptyState = memo(({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-gray-400 mb-2">🎮</div>
    <h3 className="text-lg font-semibold text-white mb-2">No games found</h3>
    <p className="text-white/60 text-sm">{message}</p>
  </div>
));

EmptyState.displayName = "EmptyState";

export const GameGrid = memo(({
  games,
  layout = "grid",
  size = "md",
  variant,
  className,
  maxItems,
  animated = false,
  priority = false,
  showActions = false,
  emptyMessage = "No games available at the moment.",
  loading = false,
  error = null,
}: GameGridProps) => {
  
  const displayGames = useMemo(() => {
    if (!games) return [];
    return maxItems ? games.slice(0, maxItems) : games;
  }, [games, maxItems]);

  const effectiveVariant = variant || (layout === "list" ? "list" : "grid");

  if (loading) {
    return <LoadingSkeleton layout={layout} size={size} />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (displayGames.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const GridWrapper = animated ? motion.div : 'div';
  const gridProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, staggerChildren: 0.1 }
  } : {};

  return (
    <GridWrapper
      className={cn(
        layout === "grid" ? `grid gap-4 ${gridSizeClasses[size]}` : "space-y-4",
        className
      )}
      {...gridProps}
    >
      <AnimatePresence mode="popLayout">
        {displayGames.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            variant={effectiveVariant}
            index={index}
            priority={priority && index < 4}
            animated={animated}
            showActions={showActions}
          />
        ))}
      </AnimatePresence>
    </GridWrapper>
  );
});

GameGrid.displayName = "GameGrid";