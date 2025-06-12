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
    threshold: 0.1, // Trigger earlier for smoother loading
    rootMargin: "200px", // Load more content before user reaches the end
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

            {/* API Usage Information */}
            <div className="mt-16 mb-8 max-w-4xl mx-auto px-4">
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Current Usage vs Intended Use
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* RAWG API Section */}
                  <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">
                      RAWG API
                    </h3>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        What it's designed for:
                      </h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Game discovery and browsing</li>
                        <li>
                          • Rich metadata (descriptions, screenshots, ratings)
                        </li>
                        <li>• Popular/trending games</li>
                        <li>• User reviews and community data</li>
                        <li>• Public API with generous rate limits</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                        <span>✅</span> How we're using it: Correctly
                      </h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Fallback for popular/trending/upcoming games</li>
                        <li>• Game discovery when IGDB fails</li>
                        <li>• Community ratings and review data</li>
                      </ul>
                    </div>
                  </div>

                  {/* IGDB API Section */}
                  <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-600/30">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">
                      IGDB API
                    </h3>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        What it's designed for:
                      </h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Professional game database</li>
                        <li>• High-quality cover art and media</li>
                        <li>• Precise release dates and developer info</li>
                        <li>• Detailed technical specifications</li>
                        <li>• Official game industry data</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                        <span>✅</span> How we're using it: Correctly
                      </h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Primary source for game metadata</li>
                        <li>• High-quality cover images</li>
                        <li>• Official developer/publisher information</li>
                        <li>• Professional game data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Hybrid Approach Section */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/20 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🔄</span> Our Hybrid Approach is Actually Ideal
                  </h3>

                  <p className="text-gray-300 mb-3">
                    Our unified service approach is better than using either
                    alone because:
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">
                      Best of Both Worlds:
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>
                        • <strong>IGDB:</strong> Professional-grade covers and
                        metadata (when available)
                      </li>
                      <li>
                        • <strong>RAWG:</strong> Comprehensive game coverage and
                        community data (as fallback)
                      </li>
                      <li>
                        • <strong>Graceful degradation:</strong> If IGDB is
                        down, RAWG keeps the app working
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">
                      Industry Best Practice:
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      This is actually how many professional gaming platforms
                      work:
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>
                        • <strong>Steam:</strong> Uses multiple data sources
                      </li>
                      <li>
                        • <strong>GamePass:</strong> Combines Microsoft's data
                        with third-party sources
                      </li>
                      <li>
                        • <strong>PlayStation Store:</strong> Uses Sony's data +
                        external sources
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Missing Features Section */}
                <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-600/20 mb-4">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <span>🎮</span> Are We Missing Anything?
                  </h3>

                  <p className="text-gray-300 mb-3">
                    We could optimize further by:
                  </p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-300 mb-1">
                        <strong>
                          1. Use RAWG for discovery, IGDB for details:
                        </strong>
                      </p>
                      <div className="bg-gray-950/60 rounded p-2 font-mono text-xs text-gray-400">
                        <div>{`// Discovery: RAWG (better search, more games)`}</div>
                        <div>
                          const searchResults = await
                          RAWGService.searchGames(query)
                        </div>
                        <div className="mt-1">{`// Details: IGDB (better metadata, covers)`}</div>
                        <div>
                          const gameDetails = await
                          IGDBService.fetchGameDetails(id)
                        </div>
                      </div>
                    </div>

                    <div className="text-gray-400">
                      <p>
                        <strong>2. Cache strategy:</strong> Keep IGDB data
                        longer (it changes less frequently)
                      </p>
                      <p>
                        <strong>3. Smart fallbacks:</strong> Use RAWG
                        screenshots when IGDB has none
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verdict Section */}
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <span>✅</span> Verdict: We're Using Them Well!
                  </h3>

                  <p className="text-gray-300 mb-3">
                    Our current approach is actually industry best practice:
                  </p>

                  <ul className="text-sm text-gray-400 space-y-1 mb-3">
                    <li>
                      • <strong>IGDB First:</strong> Get the highest quality
                      data
                    </li>
                    <li>
                      • <strong>RAWG Fallback:</strong> Ensure comprehensive
                      coverage
                    </li>
                    <li>
                      • <strong>Server-side calls:</strong> Avoid CORS and rate
                      limit issues
                    </li>
                    <li>
                      • <strong>Unified interface:</strong> Clean API for the
                      frontend
                    </li>
                  </ul>

                  <p className="text-green-300 font-medium flex items-center gap-2">
                    <span>🎯</span>
                    This gives users the best experience: beautiful IGDB covers
                    with reliable RAWG fallbacks!
                  </p>
                </div>
              </div>
            </div>

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
