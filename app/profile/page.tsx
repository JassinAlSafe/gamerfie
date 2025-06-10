"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { AboutSection } from "@/components/profile/sections/AboutSection";
import { StatsSection } from "@/components/profile/sections/StatsSection";
import { ActivitySection } from "@/components/profile/sections/ActivitySection";
import { GamesSection } from "@/components/profile/sections/GamesSection";
import { FriendsSection } from "@/components/profile/sections/FriendsSection";
import { ReviewsSection } from "@/components/profile/sections/ReviewsSection";
import { JournalSection } from "@/components/profile/sections/JournalSection";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useProfileData } from "@/hooks/Profile/useProfileData";

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const {
    profile,
    isLoading,
    error,
    gameStats,
    updateProfile,
    optimizedStats,
    statsLoading,
    refreshStats,
    friendsLoading,
    activitiesLoading,
    journalLoading,
    totalGames,
    acceptedFriends,
    recentReviews,
    recentActivities,
    recentJournalEntries,
  } = useProfileData();

  // Event handlers
  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  // Render error state
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
            onProfileUpdate={updateProfile}
          />
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <ProfileNav />
      </div>

      {/* Profile Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Profile Overview</h2>
            <ProfileActions
              onEdit={handleEditProfile}
              onSettings={handleSettingsClick}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - About & Stats & Activity */}
            <div className="md:col-span-2 space-y-6">
              <ProfileSection isLoading={isLoading} section="About">
                <AboutSection profile={profile} />
              </ProfileSection>

              <ProfileSection isLoading={statsLoading} section="Statistics">
                <StatsSection 
                  stats={optimizedStats} 
                  isLoading={statsLoading}
                  onRefresh={refreshStats}
                />
              </ProfileSection>

              <ProfileSection isLoading={activitiesLoading} section="Activity">
                <ActivitySection activities={recentActivities} />
              </ProfileSection>
            </div>

            {/* Right Column - Games & Friends */}
            <div className="space-y-6">
              <ProfileSection isLoading={isLoading} section="Games">
                <GamesSection totalGames={totalGames} />
              </ProfileSection>

              <ProfileSection isLoading={friendsLoading} section="Friends">
                <FriendsSection friends={acceptedFriends} />
              </ProfileSection>
            </div>
          </div>

          {/* Bottom Row - Reviews & Journal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <ProfileSection isLoading={journalLoading} section="Reviews">
              <ReviewsSection reviews={recentReviews} />
            </ProfileSection>

            <ProfileSection isLoading={journalLoading} section="Journal">
              <JournalSection entries={recentJournalEntries} />
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}