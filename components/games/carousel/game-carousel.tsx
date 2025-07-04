"use client";

import React, { memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Game } from "@/types";
import { GameCard } from "@/components/shared/GameCard/GameCard";

type CategoryOption =
  | "all"
  | "popular"
  | "trending"
  | "upcoming"
  | "recent"
  | "classic";

interface GameCarouselProps {
  games: Game[];
  category: CategoryOption;
  title: string;
  icon: LucideIcon;
  color: string;
}

export const GameCarousel = memo(
  ({ games = [], category, title, icon: Icon, color }: GameCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { ref } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    // Virtual scrolling setup
    const virtualizer = useVirtualizer({
      count: games?.length ?? 0,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => 280, // Match card width
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
                    `/all-games?category=${category}&timeRange=${
                      category === "upcoming"
                        ? "upcoming"
                        : category === "trending"
                        ? "trending"
                        : "popular"
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
              height: "420px", // Increased height
              position: "relative", // Fix for scroll offset calculation
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
                      width: "280px",
                      height: "400px", // Increased height
                    }}
                    className="pr-4"
                  >
                    <div className="w-full h-full relative">
                      <GameCard
                        game={game}
                        variant="carousel"
                        index={virtualItem.index}
                        category={category}
                        priority={virtualItem.index < 3}
                      />
                    </div>
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
