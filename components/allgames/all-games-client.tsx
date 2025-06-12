"use client";

import { Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { useGamesInfinite } from "@/hooks/Games/useGames"; // Updated import
import { GamesGrid } from "../games/sections/games-grid";
import { GamesError } from "../games/GamesError";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";

// Dynamically import the GamesHeader component with loading state
const GamesHeader = dynamic(
  () => import("../games/sections/games-header").then((mod) => mod.GamesHeader),
  {
    loading: () => (
      <div
        className="h-24 bg-gray-900/80 animate-pulse rounded-xl mx-4 sm:mx-6 lg:mx-8 my-4"
        aria-label="Loading games header"
        role="status"
      />
    ),
    ssr: false,
  }
);

export default function AllGamesClient() {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0, // Trigger as soon as element becomes visible
    rootMargin: "300px", // Load more content even earlier for ultra-smooth scrolling
  });

  const { handleResetFilters } = useGamesStore();

  const {
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    allGames,
  } = useGamesInfinite(); // Updated hook usage

  useUrlParams(); // Add this line to enable URL syncing

  // Load more when scrolling near bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return <GamesError error={error as Error} onReset={handleResetFilters} />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-900/50 via-gray-950 to-gray-950"
      role="region"
      aria-label="All Games"
    >
      {/* Header with backdrop blur */}
      <div className="sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950/80 backdrop-blur-sm" />
        <Suspense
          fallback={
            <div
              className="h-[140px] animate-pulse bg-gradient-to-b from-gray-900/80 to-transparent"
              aria-label="Loading games header"
              role="status"
            />
          }
        >
          <GamesHeader />
        </Suspense>
      </div>

      {/* Main content */}
      <main className="relative pb-4 pt-2">
        {/* Background pattern */}
        <div
          className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"
          aria-hidden="true"
        />

        {/* Games grid */}
        <div className="relative">
          <div className="max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
            <GamesGrid isLoading={isLoading} games={allGames} />

            {/* Load more indicator */}
            <div
              ref={loadMoreRef}
              className="flex justify-center py-6"
              aria-live="polite"
            >
              {isFetchingNextPage && (
                <div
                  className="flex items-center gap-3 text-gray-200"
                  role="status"
                >
                  <div
                    className="h-5 w-5 border-2 border-current border-t-purple-500 rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">
                    Loading more games...
                  </span>
                </div>
              )}
              {!isFetchingNextPage && !hasNextPage && allGames.length > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-1">
                    You've reached the end of the list
                  </p>
                  <p className="text-xs text-gray-500">
                    {allGames.length} games found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
