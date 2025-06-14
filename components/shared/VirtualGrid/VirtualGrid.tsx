"use client";

import React, { memo, useMemo, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Game } from "@/types";
import { GameCard, GameCardVariant } from "../GameCard/GameCard";
import { cn } from "@/lib/utils";

interface VirtualGridProps {
  games: Game[];
  variant?: GameCardVariant;
  itemsPerRow?: number;
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
  className?: string;
  overscan?: number;
  priority?: boolean;
  animated?: boolean;
}

export const VirtualGrid = memo(({
  games,
  variant = "grid",
  itemsPerRow = 4,
  itemHeight = 400,
  itemWidth = 280,
  gap = 16,
  className,
  overscan = 5,
  priority = false,
  animated = false,
}: VirtualGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const { rows, getItemsForRow } = useMemo(() => {
    const totalItems = games.length;
    const rowCount = Math.ceil(totalItems / itemsPerRow);
    
    const getItemsForRow = (rowIndex: number) => {
      const startIndex = rowIndex * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, totalItems);
      return games.slice(startIndex, endIndex);
    };

    return {
      rows: rowCount,
      getItemsForRow,
    };
  }, [games, itemsPerRow]);

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
  });

  const renderItem = useCallback((rowIndex: number, items: Game[]) => {
    return (
      <div
        className="flex gap-4 justify-start"
        style={{
          height: itemHeight,
        }}
      >
        {items.map((game, itemIndex) => {
          const globalIndex = rowIndex * itemsPerRow + itemIndex;
          return (
            <div
              key={game.id}
              style={{
                width: itemWidth,
                height: itemHeight,
              }}
            >
              <GameCard
                game={game}
                variant={variant}
                index={globalIndex}
                priority={priority && globalIndex < 8}
                animated={animated}
              />
            </div>
          );
        })}
      </div>
    );
  }, [variant, itemHeight, itemWidth, itemsPerRow, priority, animated]);

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-2">🎮</div>
        <h3 className="text-lg font-semibold text-white mb-2">No games found</h3>
        <p className="text-white/60 text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        "w-full overflow-auto",
        className
      )}
      style={{
        height: "600px", // Fixed height for virtualization
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = getItemsForRow(virtualRow.index);
          
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
            >
              {renderItem(virtualRow.index, rowItems)}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualGrid.displayName = "VirtualGrid";