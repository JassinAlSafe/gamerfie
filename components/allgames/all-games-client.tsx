"use client";

import { useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useGamesInfinite } from "@/hooks/Games/useGames";
import { GamesGrid } from "../games/sections/games-grid";
import { GamesError } from "../games/GamesError";
import { GamesHeader } from "../games/sections/games-header";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";

export default function AllGamesClient() {
  const { fetchMetadata } = useGamesStore();
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

  // Simple intersection observer - load when user approaches the bottom
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px", // Start loading 200px before reaching the element
  });

  // Clean load more function - no unnecessary complexity
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      const currentTotalGames =
        data?.pages?.flatMap((page) => page.games || [])?.length || 0;
      const nextPage = (data?.pages?.length || 0) + 1;

      console.log("🔄 Loading more games...", {
        nextPage,
        currentTotalGames,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
      });

      fetchNextPage();
    } else {
      console.log("⏸️ Not loading more games:", {
        hasNextPage,
        isFetchingNextPage,
        isLoading,
      });
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    data?.pages?.length,
    data?.pages?.flatMap((page) => page.games || [])?.length,
  ]);

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

  // Get all games from all pages
  const allGames = data?.pages?.flatMap((page) => page.games || []) ?? [];
  const totalGames = allGames.length;
  const isEndReached = !hasNextPage && !isFetchingNextPage;

  // Error state
  if (isError && error) {
    return <GamesError error={error as Error} onReset={resetFiltersAndUrl} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-gray-950 to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-950/80 backdrop-blur-sm">
        <GamesHeader />
      </div>

      {/* Main content */}
      <main className="relative pb-4 pt-2">
        <div className="max-w-[2400px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Games Grid */}
          <GamesGrid isLoading={isLoading} games={allGames} />

          {/* Infinite scroll status */}
          <div className="py-8">
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <div className="flex items-center gap-3 text-gray-200 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/30">
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    Loading more games...
                  </span>
                  {totalGames > 0 && (
                    <span className="text-xs text-gray-400">
                      ({totalGames.toLocaleString()} loaded • Page{" "}
                      {(data?.pages?.length || 0) + 1})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Invisible load trigger */}
            {hasNextPage && !isFetchingNextPage && (
              <div ref={loadMoreRef} className="h-4" />
            )}

            {/* End state */}
            {isEndReached && totalGames > 0 && (
              <div className="flex justify-center">
                <div className="text-center bg-gray-800/30 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-700/20">
                  <p className="text-sm text-gray-300 mb-1">
                    🎮 All games loaded!
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalGames.toLocaleString()} games browsed across{" "}
                    {data?.pages?.length || 0} pages
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isFetchingNextPage && totalGames === 0 && (
              <div className="flex justify-center">
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">No games found</p>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            )}

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-center">
                <div className="inline-block bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/30">
                  <p className="text-xs text-gray-400 font-mono">
                    Pages: {data?.pages?.length || 0} • Games: {totalGames} •
                    HasNext: {hasNextPage ? "✅" : "❌"} • Fetching:{" "}
                    {isFetchingNextPage ? "🔄" : "⏸️"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
