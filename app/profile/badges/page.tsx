"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/use-profile";
import LoadingSpinner from "@/components/loadingSpinner";
import UserBadges from "@/components/profile/user-badges";

export default function BadgesPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">
          {profileError?.message || "Profile not found"}
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
              stats={
                gameStats ?? {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
                }
              }
              onProfileUpdate={() => {}}
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Badges Content */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Badges</h1>
            <UserBadges />
          </div>
        </div>
      </div>
    </div>
  );
}
