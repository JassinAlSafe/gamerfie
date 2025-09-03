"use client";

import { useState, useCallback } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileCardModal } from "@/components/profile/ProfileCardModal";
import { SocialConnections } from "@/components/profile/SocialConnections";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useFriendsHandlers } from "@/hooks/friends-page-handlers";

export default function ProfileFriendsPage() {
  
  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Profile data hook
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();

  // New working handlers (replaces the old TODO functions)
  const { handleFollowUser, handleUnfollowUser, handleMessageUser, handleShareProfile } = useFriendsHandlers({
    currentUserId: profile?.id
  });

  // Profile modal handlers
  const handleOpenProfile = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalOpen(false);
    setSelectedUserId(null);
  }, []);

  // Loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={profileError?.message || "Profile not found"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[280px] sm:h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            stats={
              gameStats
                ? {
                    ...gameStats,
                    totalGames: gameStats.total_played,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
                : {
                    total_played: 0,
                    played_this_year: 0,
                    backlog: 0,
                    totalGames: 0,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
            }
            onProfileUpdate={() => {}}
          />
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="bg-gray-950/20 backdrop-blur-sm">
        <ProfileNav />
      </div>

      {/* Profile Content - Now focuses on relationship context */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialConnections onOpenProfile={handleOpenProfile} />
        </div>
      </div>

      {/* Profile Card Modal */}
      <ProfileCardModal
        isOpen={profileModalOpen}
        userId={selectedUserId || ""}
        onClose={handleCloseProfile}
        onFollow={handleFollowUser}
        onUnfollow={handleUnfollowUser}
        onMessage={handleMessageUser}
        onShare={handleShareProfile}
        currentUserId={profile?.id}
      />
    </div>
  );
}