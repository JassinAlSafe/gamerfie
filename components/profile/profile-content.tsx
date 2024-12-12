"use client";

import { ProfileHeader } from "./profile-header";
import { ProfileNav } from "./profile-nav";
import { ProfileStats } from "./profile-stats";
import { ProfileActions } from "./profile-actions";
import { GamesTab } from "./games-tab";
import { Toaster } from "react-hot-toast";
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
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full">
        <div className="absolute inset-0 h-[400px] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-90" />
        
        <div className="relative">
          <div className="absolute right-4 top-4 z-50">
            <ProfileActions
              onEdit={() => console.log("Edit clicked")}
              onSettings={() => console.log("Settings clicked")}
            />
          </div>
          
          <ProfileHeader
            profile={profile}
            stats={gameStats}
            onProfileUpdate={updateProfile}
          />
        </div>
      </div>

      <div className="sticky top-0 z-40 w-full backdrop-blur-md bg-gray-900/80 border-b border-gray-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <ProfileNav />
        </div>
      </div>

      <div className="flex-grow bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <GamesTab userId={profile.id} />
        </div>
      </div>
    </div>
  );
}
