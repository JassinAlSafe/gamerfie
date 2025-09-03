"use client";

import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useGamesInfinite } from "@/hooks/Games/useGames";
import { GamesGrid } from "../games/sections/games-grid";
import { GamesError } from "../games/GamesError";
import { GamesHeader } from "../games/sections/games-header";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";
import { getMobileOptimizedIntersectionConfig } from "@/utils/mobile-detection";
export default function AllGamesClient() {
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
    refetch,
  } = useGamesInfinite();

  // Pull-to-refresh state
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullThreshold = 100;

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

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !containerRef.current) return;

    const currentY = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY - pullStartY);
    const progress = Math.min(pullDistance / pullThreshold, 1);

    setPullProgress(progress);

    if (pullDistance > 20) {
      e.preventDefault();
    }
  }, [isPulling, pullStartY, pullThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    const shouldRefresh = pullProgress >= 1;
    
    // Always reset the pulling state first
    setIsPulling(false);
    
    if (shouldRefresh) {
      // Keep the indicator visible during refresh
      await handleRefresh();
    }
    
    // Reset progress and position
    setPullProgress(0);
    setPullStartY(0);
  }, [isPulling, pullProgress, handleRefresh]);

  // Reset pull state when refresh completes
  useEffect(() => {
    if (!isRefreshing) {
      setPullProgress(0);
      setIsPulling(false);
      setPullStartY(0);
    }
  }, [isRefreshing]);

  // Fetch metadata once on mount
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Cleanup function to reset pull state on unmount/navigation
  useEffect(() => {
    return () => {
      setPullProgress(0);
      setIsPulling(false);
      setIsRefreshing(false);
      setPullStartY(0);
    };
  }, []);

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
    <div className="w-full">
      {/* Games Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50">
        <GamesHeader games={allGames} />
      </div>

      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {(pullProgress > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/50"
          >
            <RefreshCw 
              className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${
                pullProgress >= 1 || isRefreshing ? 'animate-spin' : ''
              }`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            />
            <span className="text-sm font-medium text-white">
              {isRefreshing 
                ? 'Refreshing...' 
                : pullProgress >= 1 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with pull-to-refresh */}
      <div 
        ref={containerRef}
        className="bg-gradient-to-b from-gray-900/50 via-gray-950 to-gray-950 min-h-screen overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">

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
      </div>
    </div>
  );
}
