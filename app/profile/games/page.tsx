"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { GamesTab } from "@/components/profile/games-tab";
import { GameFilters, GameFilters as GameFiltersType } from "@/components/profile/game-filters";
import LoadingSpinner from "@/components/loadingSpinner";
import { fetchUserGames } from "@/utils/game-utils";

export default function ProfileGamesPage() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const [filters, setFilters] = useState<GameFiltersType>({
    status: 'all',
    sortBy: 'recent',
    sortOrder: 'desc',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950 text-red-500">
        <p className="text-xl font-semibold">
          {error?.message || "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />
        
        {/* Profile Content */}
        <div className="relative pt-8">
          {/* Profile Info and Stats */}
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={gameStats}
              onProfileUpdate={() => {}}
              minimal
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="flex-grow bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            <GameFilters onFilterChange={setFilters} />
            <GamesTab userId={profile.id} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
} 