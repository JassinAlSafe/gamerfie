"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useSettings } from "@/hooks/use-settings";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { GamesTab } from "@/components/profile/games-tab";
import {
  GameFilters,
  GameFilters as GameFiltersType,
} from "@/components/profile/game-filters";
import LoadingSpinner from "@/components/loadingSpinner";
import { fetchUserGames } from "@/utils/game-utils";

export default function ProfileGamesPage() {
  const { profile, isLoading: profileLoading, error, gameStats } = useProfile();
  const { settings } = useSettings();
  const [filters, setFilters] = useState<GameFilters>({
    status: "all",
    sortBy: "recent",
    sortOrder: "desc",
    view: settings.gamesView
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      view: settings.gamesView
    }));
  }, [settings.gamesView]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">
          {error?.message || "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

      {/* Main Content Container */}
      <div className="relative flex flex-col flex-grow">
        {/* Profile Header Section */}
        <div className="pt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={gameStats}
              onProfileUpdate={() => {}}
              minimal
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Games Grid */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col space-y-6">
              <GameFilters onFilterChange={setFilters} />
              <GamesTab userId={profile.id} filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
