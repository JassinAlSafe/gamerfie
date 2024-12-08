"use client";

import { useState } from "react";
import { useProfile } from "@/app/hooks/use-profile";
import { ProfileHeader } from "./profile-header";
import { ProfileNav } from "./profile-nav";
import { GamesTab } from "./games-tab";
import { ProfileError } from "./profile-error";
import { Toaster } from "react-hot-toast";

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return <ProfileError />;
  }

  return (
    <div className="min-h-screen bg-[#0f1116]">
      <div className="relative">
        {/* Gradient background that extends behind the nav */}
        <div className="absolute inset-0 h-[400px] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-90" />

        {/* Content */}
        <div className="relative">
          <Toaster position="top-center" />
          <ProfileHeader
            profile={profile}
            stats={gameStats}
            onProfileUpdate={updateProfile}
          />

          {/* Navigation with glass effect */}
          <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-800/50 shadow-lg">
            <div className="container mx-auto">
              <ProfileNav />
            </div>
          </div>

          {/* Main content */}
          <div className="container mx-auto px-4 py-8">
            <GamesTab userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
