"use client";

import React, { memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GameCarouselProps } from "@/types/game";
import { GameCard } from "@/components/games/cards/game-card";

export const GameCarousel = memo(
  ({ games = [], category, title, icon: Icon, color }: GameCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    // Virtual scrolling setup
    const virtualizer = useVirtualizer({
      count: games?.length ?? 0,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => 240 + 16, // Width + larger gap
      horizontal: true,
      overscan: 3,
    });

    const scroll = useCallback((direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = direction === "left" ? -480 : 480; // Adjusted scroll amount
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, []);

    // If games is undefined or null, return early
    if (!games) {
      return null;
    }

    return (
      <div className="relative group" ref={ref}>
        <div className="relative w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Icon className={`h-7 w-7 ${color}`} />
              <h2 className="text-3xl font-bold text-white">{title}</h2>
            </div>
            {category && (
              <Button
                variant="ghost"
                className="text-purple-400 hover:text-purple-300"
                onClick={() =>
                  router.push(
                    `/all-games?category=${
                      category === "new" ? "recent" : category
                    }`
                  )
                }
              >
                View All
              </Button>
            )}
          </div>

          <div
            ref={scrollContainerRef}
            className="relative w-full overflow-x-auto scrollbar-hide px-1"
            style={{
              height: "360px",
            }}
          >
            <div
              style={{
                width: `${virtualizer.getTotalSize()}px`,
                height: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const game = games[virtualItem.index];
                return (
                  <div
                    key={game.id}
                    style={{
                      position: "absolute",
                      left: `${virtualItem.start}px`,
                      width: "240px",
                      height: "100%",
                    }}
                    className="pr-4" // Increased gap between cards
                  >
                    <GameCard game={game} />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black"
            disabled={!scrollContainerRef.current?.scrollLeft}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
);

GameCarousel.displayName = "GameCarousel";
