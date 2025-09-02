"use client";

import { useState, useCallback } from "react";
import { Metadata } from "next";
import { SocialHub } from "@/components/friends/SocialHub";
import { FriendsErrorBoundary } from "@/components/friends/FriendsErrorBoundary";
import { ProfileCardModal } from "@/components/profile/ProfileCardModal";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useFriendsHandlers } from "@/hooks/friends-page-handlers";

// Note: metadata export moved to separate file due to "use client"
export default function FriendsPage() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Profile data hook for current user
  const { profile } = useProfile();

  // Friend action handlers
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

  return (
    <FriendsErrorBoundary>
      <SocialHub onOpenProfile={handleOpenProfile} />
      
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
    </FriendsErrorBoundary>
  );
}