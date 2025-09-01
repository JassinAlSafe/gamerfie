"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isMobileDevice } from "@/utils/mobile-detection";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { FriendActivityFeed } from "@/components/friends/friend-activity-feed";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useProfileData } from "@/hooks/Profile/useProfileData";
import { useProfileActivities } from "@/hooks/Profile/use-profile-activities";
import { Activity } from "lucide-react";
import type { GameStats } from "@/types/user";

export default function ActivityPage(): JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const {
    profile,
    isLoading,
    error,
    gameStats,
    updateProfile,
  } = useProfileData();

  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useProfileActivities(20); // Show more activities on dedicated page

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

      {/* Activity Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          {/* Page Title - Improved mobile layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Activity Feed</h1>
                <p className="text-gray-400 text-sm sm:text-base mt-0.5 sm:mt-1">Stay connected with your gaming community</p>
              </div>
            </div>
          </div>

          {/* Activity Feed Component - Improved container */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-800/40 overflow-hidden shadow-xl">
            {activitiesLoading ? (
              <div className="p-4 sm:p-6">
                <LoadingState />
              </div>
            ) : activitiesError ? (
              <div className="p-4 sm:p-6">
                <ErrorState 
                  error="Failed to load activities" 
                  retry={() => refetchActivities()}
                />
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <FriendActivityFeed />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}