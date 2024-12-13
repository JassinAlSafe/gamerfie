"use client";

import { ProfileHeader } from "./profile-header";
import { ProfileNav } from "./profile-nav";
import { ProfileActions } from "./profile-actions";
import { GamesTab } from "./games-tab";
import { Profile } from "@/types/user";

interface ProfileContentProps {
  profile: Profile;
  gameStats: {
    total_played: number;
    played_this_year: number;
    backlog: number;
  };
  updateProfile: (_updates: Partial<Profile>) => Promise<void>;
}

export function ProfileContent({
  profile,
  gameStats,
  updateProfile,
}: ProfileContentProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Background */}
      <div className="relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />
        
        {/* Content Container */}
        <div className="relative">
          {/* Profile Actions */}
          <div className="absolute right-4 top-4 z-50">
            <ProfileActions
              onEdit={() => console.log("Edit clicked")}
              onSettings={() => console.log("Settings clicked")}
            />
          </div>

          {/* Profile Info and Stats */}
          <div className="max-w-7xl mx-auto">
            <ProfileHeader
              profile={profile}
              stats={gameStats}
              onProfileUpdate={updateProfile}
            />
          </div>
        </div>

        {/* Navigation - Positioned at bottom of hero section */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <ProfileNav />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4">
          <GamesTab userId={profile.id} />
        </div>
      </div>
    </div>
  );
}
