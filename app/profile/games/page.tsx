"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import {
  GameFilters,
  type GameFilters as GameFiltersType,
} from "@/components/profile/game-filters";
import GamesTab from "@/components/profile/games-tab";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCoverImageUrl } from "@/utils/image-utils";
import { GameCoverImage } from "@/components/ui/game-cover-image";
import type { ProcessedGame } from "@/types/game";

function GameItem({ game }: { game: ProcessedGame }) {
  // Handle both RAWG and IGDB cover image formats with better fallbacks
  const coverUrl =
    game.games?.cover_url || // From games table
    game.cover_url || // Direct cover_url
    game.coverImage || // IGDB format
    game.games?.background_image; // RAWG format

  const processedCoverUrl = getCoverImageUrl(coverUrl);

  return (
    <div className="relative group">
      <GameCoverImage
        src={processedCoverUrl}
        alt={game.title || game.name || "Game Cover"}
      />
      {/* ...rest of the GameItem component... */}
    </div>
  );
}

export default function GamesPage() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const { libraryView, setLibraryView } = useSettingsStore();
  const [filters, setFilters] = useState<GameFiltersType>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
  });

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
            stats={gameStats}
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
            <h1 className="text-3xl font-bold text-white">Games Library</h1>
            <div className="flex gap-2">
              <Button
                variant={libraryView === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setLibraryView("grid")}
                className="w-10 h-10"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={libraryView === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setLibraryView("list")}
                className="w-10 h-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Content */}
          <div className="space-y-8">
            <GameFilters onFilterChange={setFilters} />
            <GamesTab filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
