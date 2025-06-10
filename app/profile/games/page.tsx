"use client";

import { useState, useMemo, Suspense, lazy } from "react";
import { useProfile } from "@/hooks/Profile/use-profile";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import {
  GameFilters,
  type GameFilters as GameFiltersType,
} from "@/components/profile/game-filters";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { LayoutGrid, List } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
// Commented out unused imports
// import { getCoverImageUrl } from "@/utils/image-utils";
// import { GameCoverImage } from "@/components/ui/game-cover-image";
// import type { ProcessedGame } from "@/types";
import type { GameStats } from "@/types/user";

// Lazy load the GamesTab component
const GamesTab = lazy(() => import("@/components/profile/games-tab"));

// Skeleton component for loading state
const GamesTabSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
      <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array(15)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gray-800 rounded-lg animate-pulse"
          ></div>
        ))}
    </div>
  </div>
);

// Game cover image component
// const _GameCoverImage = ({ src, alt }: { src: string; alt: string }) => {

export default function GamesPage() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const { libraryView, setLibraryView } = useSettingsStore();
  const [filters, setFilters] = useState<GameFiltersType>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
  });

  // Memoize filter change handler
  const handleFilterChange = useMemo(() => {
    return (newFilters: GameFiltersType) => {
      setFilters(newFilters);
    };
  }, []);

  // Safely access gameStats properties
  const totalGames =
    gameStats && typeof gameStats === "object" && "total_played" in gameStats
      ? gameStats.total_played
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (error || !profile || !gameStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={error?.message || "Profile not found"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            stats={gameStats as GameStats}
            onProfileUpdate={() => {}}
          />
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <ProfileNav />
      </div>

      {/* Games Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Page Title and Actions */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              Games Library
              <span className="ml-3 text-lg font-normal text-gray-400">
                {totalGames} games
              </span>
            </h1>
            <div className="flex gap-2">
              <Button
                variant={libraryView === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setLibraryView("grid")}
                className="w-10 h-10"
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={libraryView === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setLibraryView("list")}
                className="w-10 h-10"
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Content */}
          <div className="space-y-8">
            <GameFilters onFilterChange={handleFilterChange} />
            <Suspense fallback={<GamesTabSkeleton />}>
              <GamesTab filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
