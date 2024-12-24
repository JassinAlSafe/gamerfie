"use client";

import React, {
  memo,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Users,
  Gamepad2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureAbsoluteUrl } from "@/lib/utils";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";

// Types moved to types/game.ts
import { Game, GameCategories } from "@/types/game";

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const formatRating = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return "";
  return Math.round(rating).toString();
};

const BlurImage = memo(
  ({
    src,
    alt,
    priority = false,
  }: {
    src: string;
    alt: string;
    priority?: boolean;
  }) => {
    const [isLoading, setLoading] = React.useState(true);

    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`
        object-cover transition-all duration-300
        ${isLoading ? "scale-110 blur-xl" : "scale-100 blur-0"}
      `}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
        quality={90}
        onLoad={() => setLoading(false)}
      />
    );
  }
);

BlurImage.displayName = "BlurImage";

const GameCard = memo(
  ({ game, index, inView }: { game: Game; index: number; inView: boolean }) => {
    const { ref, inView: cardInView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <Link
        href={`/game/${game.id}`}
        className="flex-shrink-0 w-[160px]"
        ref={ref}
      >
        <motion.div
          className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg cursor-pointer border border-white/5"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {game.cover?.url ? (
            cardInView && inView ? (
              <BlurImage
                src={ensureAbsoluteUrl(game.cover.url)}
                alt={game.name}
                priority={index < 4}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800 animate-pulse" />
            )
          ) : (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-gray-600" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xs font-semibold text-white line-clamp-2 mb-1">
              {game.name}
            </h3>
            <div className="flex items-center gap-3">
              {game.rating ? (
                <div className="flex items-center text-yellow-400">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  <span className="text-xs">{formatRating(game.rating)}</span>
                </div>
              ) : null}
              {game.total_rating_count && game.total_rating_count > 0 && (
                <div className="flex items-center text-gray-400">
                  <Users className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    {formatNumber(game.total_rating_count)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }
);

GameCard.displayName = "GameCard";

const GameCarousel = memo(
  ({ games, category = "popular" }: { games: Game[]; category?: string }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    // Virtual scrolling setup
    const virtualizer = useVirtualizer({
      count: games.length,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => 160 + 12, // card width + gap
      horizontal: true,
      overscan: 3,
    });

    // Get category label
    const getCategoryLabel = (category: string) => {
      switch (category) {
        case "upcoming":
          return {
            title: "Upcoming Games",
            color: "text-purple-500",
            icon: Calendar,
          };
        case "new":
          return {
            title: "New Releases",
            color: "text-yellow-500",
            icon: Sparkles,
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

    const { title, color, icon: Icon } = getCategoryLabel(category);

    const scroll = useCallback((direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = direction === "left" ? -320 : 320;
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, []);

    return (
      <div className="relative group" ref={ref}>
        <div className="relative w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Icon className={`h-6 w-6 ${color}`} />
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
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
          </div>

          <div
            ref={scrollContainerRef}
            className="relative w-full overflow-x-auto scrollbar-hide"
            style={{
              height: "280px", // Fixed height for the scroll container
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
                      width: "160px", // Fixed width for game cards
                      height: "100%", // Take full height of container
                    }}
                    className="pr-3" // Add padding for gap
                  >
                    <GameCard
                      game={game}
                      index={virtualItem.index}
                      inView={inView}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={!scrollContainerRef.current?.scrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

GameCarousel.displayName = "GameCarousel";

const CategorySkeleton = memo(() => (
  <div className="mb-12">
    <div className="h-8 w-48 bg-gray-800/50 rounded mb-4" />
    <div className="flex gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4]">
          <Card className="w-full h-full animate-pulse bg-gray-800/50" />
        </div>
      ))}
    </div>
  </div>
));

CategorySkeleton.displayName = "CategorySkeleton";

const ErrorDisplay = memo(
  ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <AlertCircle className="w-12 h-12 mb-4" />
      <p className="mb-4 text-center max-w-md">{message}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="text-gray-400 hover:text-white"
      >
        Try Again
      </Button>
    </div>
  )
);

ErrorDisplay.displayName = "ErrorDisplay";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <p className="text-red-400">Something went wrong:</p>
      <pre className="text-sm text-red-300">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">
        Try again
      </Button>
    </div>
  );
}

interface GameCategoryData {
  topRated: Game[];
  newReleases: Game[];
  upcoming: Game[];
  trending: Game[];
}

interface PopularGamesSectionProps {
  category?: "popular" | "upcoming" | "new";
}

const PopularGamesSection = memo(
  ({ category = "popular" }: PopularGamesSectionProps) => {
    const queryClient = useQueryClient();

    // Prefetch the next category
    useEffect(() => {
      const categories = ["popular", "upcoming", "new"];
      const currentIndex = categories.indexOf(category);
      const nextCategory = categories[(currentIndex + 1) % categories.length];

      queryClient.prefetchQuery({
        queryKey: ["popularGames", nextCategory],
        queryFn: () => fetchGames(nextCategory),
      });
    }, [category, queryClient]);

    const fetchGames = async (cat: string): Promise<GameCategoryData> => {
      const response = await fetch(`/api/games/popular?category=${cat}`);
      if (!response.ok) {
        throw new Error("Failed to fetch popular games");
      }
      const data = await response.json();
      return {
        topRated: data.topRated || [],
        newReleases: data.newReleases || [],
        upcoming: data.upcoming || [],
        trending: data.trending || [],
      };
    };

    const {
      data: categories,
      isLoading,
      error,
      refetch,
    } = useQuery<GameCategoryData, Error>({
      queryKey: ["popularGames", category],
      queryFn: () => fetchGames(category),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    });

    if (isLoading) {
      return <CategorySkeleton />;
    }

    if (error) {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ErrorDisplay
            message={
              error instanceof Error ? error.message : "Failed to load games"
            }
            onRetry={() => refetch()}
          />
        </ErrorBoundary>
      );
    }

    if (!categories) {
      return (
        <div className="text-center py-12 text-gray-400">
          <p>No games found at the moment.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Refresh
          </Button>
        </div>
      );
    }

    const games =
      category === "popular"
        ? categories.topRated
        : category === "new"
        ? categories.newReleases
        : category === "upcoming"
        ? categories.upcoming
        : categories.trending;

    return <GameCarousel games={games} category={category} />;
  }
);

PopularGamesSection.displayName = "PopularGamesSection";

export default PopularGamesSection;
