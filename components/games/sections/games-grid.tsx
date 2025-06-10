"use client";
import React, { useEffect } from "react";
import { memo, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWindowSize } from "@/hooks/Settings/useWindowSize";
import { Game } from "@/types/game";
import { GameCard } from "@/components/GameCard"; // Update import path
import { useGamesStore } from "@/stores/useGamesStore";
import { Gamepad2 } from "lucide-react";
import { useViewModeStore } from "@/stores/useViewModeStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ListViewGameCard } from "../cards/list-view-game-card";

interface GamesGridProps {
  isLoading: boolean;
  games: Game[];
}

const GamesGrid = memo(({ games, isLoading }: GamesGridProps) => {
  const { fetchMetadata } = useGamesStore();
  const { width } = useWindowSize();
  const parentRef = useRef<HTMLDivElement>(null);
  const { viewMode } = useViewModeStore();

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Calculate columns based on viewport width
  const columns = useMemo(() => {
    if (viewMode === "list") return 1;

    if (width >= 1536) return 6;
    if (width >= 1280) return 5;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width, viewMode]);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(games.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === "list" ? 120 : 300), // Adjust row height based on view mode
    overscan: 5,
  });

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8"
            : "flex flex-col gap-3"
        )}
        role="status"
        aria-label="Loading games"
      >
        {Array.from({ length: viewMode === "grid" ? 18 : 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-800/50",
              viewMode === "grid"
                ? "aspect-[3/4] rounded-xl"
                : "h-24 rounded-lg flex items-center"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (!games?.length) {
    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        <Gamepad2 className="h-12 w-12 text-gray-700" aria-hidden="true" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            No Games Found
          </h2>
          <p className="text-gray-400 max-w-md">
            No games found matching your filters. Try adjusting your search
            criteria or removing some filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-180px)] overflow-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700 pr-1"
      style={{ contain: "strict" }}
      role="region"
      aria-label="Games grid"
      tabIndex={0}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
        aria-live="polite"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowGames = games.slice(startIndex, startIndex + columns);

          // Determine if this row contains above-the-fold content (first 2 rows)
          const isAboveTheFold = virtualRow.index < 2;

          return (
            <motion.div
              key={virtualRow.index}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8"
                  : "flex flex-col gap-3"
              )}
              role="row"
            >
              {rowGames.map((game, _idx) => (
                <motion.div
                  key={game.id}
                  variants={itemVariants}
                  role="gridcell"
                  className={cn(
                    "transition-all duration-300",
                    viewMode === "grid" ? "hover:scale-[1.02]" : ""
                  )}
                >
                  {viewMode === "grid" ? (
                    <GameCard
                      game={game}
                      category="popular"
                      priority={isAboveTheFold} // Use priority loading for above-the-fold images
                    />
                  ) : (
                    <ListViewGameCard
                      game={game}
                      priority={isAboveTheFold} // Use priority loading for above-the-fold images
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

GamesGrid.displayName = "GamesGrid";

export { GamesGrid };
