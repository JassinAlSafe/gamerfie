"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useGamesInfinite } from "@/hooks/Games/useGames";
import { GamesGrid } from "../games/sections/games-grid";
import { GamesError } from "../games/GamesError";
import { GamesHeader } from "../games/sections/games-header";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";
import { getMobileOptimizedIntersectionConfig } from "@/utils/mobile-detection";
import { Game } from "@/types";

interface AllGamesClientProps {}

export default function AllGamesClient({}: AllGamesClientProps = {}) {
  const gamesStore = useGamesStore();
  const { fetchMetadata } = gamesStore;
  const { resetFiltersAndUrl } = useUrlParams();

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useGamesInfinite();

  // Mobile-optimized intersection observer - load when user approaches the bottom
  const { ref: loadMoreRef, inView } = useInView(getMobileOptimizedIntersectionConfig());

  // Get all games from all pages - memoized to avoid recalculation
  const allGames = useMemo(() => {
    return data?.pages?.flatMap((page) => page.games || []) ?? [];
  }, [data?.pages]);

  // Clean load more function - simplified dependencies
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Fetch metadata once on mount
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Trigger load more when intersection observer detects visibility
  useEffect(() => {
    if (inView) {
      handleLoadMore();
    }
  }, [inView, handleLoadMore]);

  const totalGames = allGames.length;
  const isEndReached = !hasNextPage && !isFetchingNextPage;

  // Error state
  if (isError && error) {
    return <GamesError error={error as Error} onReset={resetFiltersAndUrl} />;
  }


  return (
    <>
      {/* Header - Semi-sticky with better UX */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50">
        <GamesHeader games={allGames} />
      </header>

      {/* Main content - Natural scroll */}
      <main className="min-h-screen bg-gradient-to-b from-gray-900/50 via-gray-950 to-gray-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

          {/* Games Grid */}
          <GamesGrid isLoading={isLoading} games={allGames} />

          {/* Infinite scroll indicators */}
          <div className="mt-12 mb-8">
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/30">
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium text-gray-200">
                    Loading more games...
                  </span>
                </div>
              </div>
            )}

            {/* Invisible load trigger */}
            {hasNextPage && !isFetchingNextPage && (
              <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            )}

            {/* End state */}
            {isEndReached && totalGames > 0 && (
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-purple-500/30">
                  <p className="text-sm text-gray-200 mb-1">
                    🎮 All {totalGames.toLocaleString()} games loaded!
                  </p>
                  <p className="text-xs text-gray-400">
                    Browse complete • Thanks for exploring our library
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isFetchingNextPage && totalGames === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-2">No games found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
