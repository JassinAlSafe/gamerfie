"use client";

import { useState, useCallback, useMemo, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { SocialHub } from "@/components/friends/SocialHub";
import { FriendsErrorBoundary } from "@/components/friends/FriendsErrorBoundary";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useFriendsHandlers } from "@/hooks/friends-page-handlers";

// Dynamic import for ProfileCardModal (code splitting optimization)
const ProfileCardModal = dynamic(
  () => import("@/components/profile/ProfileCardModal").then(mod => ({ default: mod.ProfileCardModal })),
  {
    loading: () => <div className="fixed inset-0 bg-black/20 animate-pulse" />,
    ssr: false // Modal doesn't need SSR
  }
);

// Modal state type for better TypeScript
interface ModalState {
  isOpen: boolean;
  userId: string | null;
}

export default function FriendsPage() {
  // Optimized modal state using single object (Next.js 14 pattern)
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    userId: null
  });

  const { profile } = useProfile();

  // Memoize handlers configuration (performance optimization)
  const handlersConfig = useMemo(
    () => ({ currentUserId: profile?.id }),
    [profile?.id]
  );
  
  const { handleFollowUser, handleUnfollowUser, handleMessageUser, handleShareProfile } = useFriendsHandlers(handlersConfig);

  // Optimized modal handlers (Next.js 14 state pattern)
  const handleOpenProfile = useCallback((userId: string) => {
    setModalState({ isOpen: true, userId });
  }, []);

  const handleCloseProfile = useCallback(() => {
    setModalState({ isOpen: false, userId: null });
  }, []);

  // Memoized modal props (performance optimization)
  const modalProps: ComponentProps<typeof ProfileCardModal> = useMemo(() => ({
    isOpen: modalState.isOpen,
    userId: modalState.userId || "",
    onClose: handleCloseProfile,
    onFollow: handleFollowUser,
    onUnfollow: handleUnfollowUser,
    onMessage: handleMessageUser,
    onShare: handleShareProfile,
    currentUserId: profile?.id,
  }), [
    modalState,
    handleCloseProfile,
    handleFollowUser,
    handleUnfollowUser,
    handleMessageUser,
    handleShareProfile,
    profile?.id
  ]);

  return (
    <FriendsErrorBoundary>
      <SocialHub onOpenProfile={handleOpenProfile} />
      
      {/* Conditionally render modal (Next.js 14 optimization) */}
      {modalState.isOpen && <ProfileCardModal {...modalProps} />}
    </FriendsErrorBoundary>
  );
}