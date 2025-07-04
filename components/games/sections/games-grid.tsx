"use client";
import React from "react";
import { memo } from "react";
import { Game } from "@/types";
import { GameCard } from "@/components/shared/GameCard/GameCard";
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
  const { viewMode } = useViewModeStore();

  // Animation variants for better UX
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02, // Faster stagger for better perceived performance
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.25, // Faster animations
        ease: "easeOut"
      },
    },
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full",
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
            : "flex flex-col gap-3"
        )}
        role="status"
        aria-label="Loading games"
      >
        {Array.from({ length: viewMode === "grid" ? 24 : 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-800/30 border border-gray-700/50",
              viewMode === "grid"
                ? "aspect-[3/4] rounded-xl"
                : "h-24 rounded-lg"
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
        className="flex flex-col items-center justify-center py-24"
        role="status"
        aria-live="polite"
      >
        <Gamepad2 className="h-16 w-16 text-gray-600 mb-6" aria-hidden="true" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            No Games Found
          </h2>
          <p className="text-gray-400 max-w-md leading-relaxed">
            No games found matching your filters. Try adjusting your search
            criteria or removing some filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "w-full",
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
          : "flex flex-col gap-3"
      )}
      role="region"
      aria-label="Games grid"
    >
      {games.map((game, index) => {
        // Prioritize first 12 images for better perceived performance
        const isAboveTheFold = index < 12;

        return (
          <motion.div
            key={game.id}
            variants={itemVariants}
            className={cn(
              "group",
              viewMode === "grid" && "hover:scale-[1.02] transition-transform duration-200"
            )}
            role={viewMode === "grid" ? "gridcell" : "listitem"}
          >
            {viewMode === "grid" ? (
              <GameCard
                game={game}
                category="popular"
                priority={isAboveTheFold}
              />
            ) : (
              <ListViewGameCard
                game={game}
                priority={isAboveTheFold}
              />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
});

GamesGrid.displayName = "GamesGrid";

export { GamesGrid };
