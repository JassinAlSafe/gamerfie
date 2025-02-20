"use client";

import { Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { useGamesInfinite } from "@/hooks/Games/useGames"; // Updated import
import { GamesGrid } from "../games/sections/games-grid";
import { GamesError } from "../games/GamesError";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUrlParams } from "@/hooks/Settings/useUrlParams";

const GamesHeader = dynamic(
  () => import("../games/sections/games-header").then((mod) => mod.GamesHeader),
  {
    loading: () => <div className="h-20 bg-gray-800 animate-pulse" />,
    ssr: false,
  }
);

export default function AllGamesClient() {
  const { ref: loadMoreRef, inView } = useInView();
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
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (error) {
    return <GamesError error={error as Error} onReset={handleResetFilters} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-gray-950 to-gray-950">
      <div className="sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950/80 backdrop-blur-sm" />
        <Suspense
          fallback={
            <div className="h-[140px] animate-pulse bg-gradient-to-b from-gray-900/80 to-transparent" />
          }
        >
          <GamesHeader />
        </Suspense>
      </div>

      <main className="relative pb-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="relative">
          <div className="max-w-[2400px] mx-auto">
            <GamesGrid isLoading={isLoading} games={allGames} />

            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="h-5 w-5 border-2 border-current border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    Loading more games...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
