"use client";
import React, { useEffect } from "react";
import { memo, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWindowSize } from "@/hooks/Settings/useWindowSize";
import { Game } from "@/types/game";
import { GameCard } from "@/components/GameCard"; // Update import path
import { useGamesStore } from "@/stores/useGamesStore";

interface GamesGridProps {
  isLoading: boolean;
  games: Game[];
}

const GamesGrid = memo(({ games, isLoading }: GamesGridProps) => {
  const { fetchMetadata } = useGamesStore();
  const { width } = useWindowSize();
  const parentRef = useRef(null);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Calculate columns based on viewport width
  const columns = useMemo(() => {
    if (width >= 1536) return 6;
    if (width >= 1280) return 5;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width]);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(games.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimate row height
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 px-1">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl bg-gray-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!games?.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-400 text-center">
          No games found matching your filters.
          <br />
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-140px)] overflow-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-700"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowGames = games.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 px-1"
            >
              {rowGames.map((game) => (
                <GameCard key={game.id} game={game} category="popular" />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

GamesGrid.displayName = "GamesGrid";

export { GamesGrid };
