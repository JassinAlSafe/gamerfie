"use client";

import { useState } from "react";
import { useProfile } from "@/app/hooks/use-profile";
import { ProfileHeader } from "./profile-header";
import { ProfileInfo } from "./profile-info";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";
import { ProfileError } from "./profile-error";
import { Toaster } from "react-hot-toast";
import { ProfileNav } from "./profile-nav";
import { GamesTab } from "./games-tab";

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return <ProfileError />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-center" />
      <ProfileHeader
        profile={profile}
        stats={gameStats}
        onProfileUpdate={updateProfile}
      />
      <ProfileNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       
          <div className="md:col-span-2">
            <GamesTab userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
