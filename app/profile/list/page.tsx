"use client";

import { useProfile } from "@/hooks/Profile/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import GameListsClient from "@/components/GameList/GameListsClient";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import type { GameStats } from "@/types/user";

export default function ListsPage() {
  const { profile, isLoading, error, gameStats } = useProfile();

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
      <div className="bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <ProfileNav />
      </div>

      {/* Lists Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <GameListsClient />
        </div>
      </div>
    </div>
  );
}