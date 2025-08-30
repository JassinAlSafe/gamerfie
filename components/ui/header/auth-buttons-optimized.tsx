"use client";

import React from "react";
import { ProfileDropdown } from "../profile/profile-dropdown";
import { AnimatedButton } from "../animated-button";
import { useAuthUser, useAuthStatus, useAuthActions } from "@/stores/useAuthStoreOptimized";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// =============================================================================
// CONFIGURATION
// =============================================================================

const BUTTON_STYLES = {
  SIGN_IN: {
    className: "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900",
    variant: "ghost" as const,
    glowColor: "gray" as const,
  },
  SIGN_UP: {
    className: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900",
    variant: "default" as const,
    glowColor: "purple" as const,
  }
} as const;

const LOADING_SKELETON = {
  className: "flex items-center gap-3",
  buttons: [
    { width: "w-16", height: "h-9" },
    { width: "w-20", height: "h-9" }
  ]
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getScopeMessage = (scope: 'global' | 'local' | 'others'): string => {
  switch (scope) {
    case 'global': return 'Signed out from all devices';
    case 'others': return 'Signed out from other devices';
    default: return 'Signed out successfully';
  }
};

// =============================================================================
// LOADING SKELETON COMPONENT
// =============================================================================

const AuthButtonsSkeleton = React.memo(function AuthButtonsSkeleton() {
  return (
    <div className={LOADING_SKELETON.className}>
      {LOADING_SKELETON.buttons.map((button, index) => (
        <Skeleton 
          key={index}
          className={`${button.height} ${button.width}`} 
        />
      ))}
    </div>
  );
});

// =============================================================================
// SIGN IN/UP BUTTONS COMPONENT
// =============================================================================

const UnauthenticatedButtons = React.memo(function UnauthenticatedButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <AnimatedButton
        variant={BUTTON_STYLES.SIGN_IN.variant}
        size="default"
        glowColor={BUTTON_STYLES.SIGN_IN.glowColor}
        onClick={() => router.push("/signin")}
        className={BUTTON_STYLES.SIGN_IN.className}
        aria-label="Sign in to your account"
      >
        Sign In
      </AnimatedButton>
      <AnimatedButton
        variant={BUTTON_STYLES.SIGN_UP.variant}
        size="default"
        glowColor={BUTTON_STYLES.SIGN_UP.glowColor}
        onClick={() => router.push("/signup")}
        className={BUTTON_STYLES.SIGN_UP.className}
        aria-label="Create a new account"
      >
        Sign Up
      </AnimatedButton>
    </div>
  );
});

// =============================================================================
// MAIN AUTH BUTTONS COMPONENT
// =============================================================================

export const AuthButtonsOptimized = React.memo(function AuthButtonsOptimized() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Use optimized selectors to prevent unnecessary re-renders
  const { user, isProfileLoading } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { signOut } = useAuthActions();

  const handleSignOut = React.useCallback(async (scope: 'global' | 'local' | 'others' = 'local') => {
    try {
      await signOut(scope);
      
      // Clear any additional client-side storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('gameVault.preferences');
      }
      
      // Navigate to home and force a full refresh to clear all state
      console.log('Logout completed, navigating to home and refreshing');
      router.push("/");
      router.refresh(); // Force refresh to ensure server-side rendering reflects logout
      
      // Additional page refresh after a brief delay to ensure everything is cleared
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 100);
      
      toast({
        title: "Signed out",
        description: getScopeMessage(scope),
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [signOut, router, toast]);

  // Show skeleton while initializing
  if (!isInitialized) {
    return <AuthButtonsSkeleton />;
  }

  // Show authenticated state immediately, even if profile is still loading
  if (user) {
    return (
      <ProfileDropdown 
        user={user} 
        onSignOut={handleSignOut}
        isProfileLoading={isProfileLoading}
      />
    );
  }

  // Show unauthenticated buttons
  return <UnauthenticatedButtons />;
});

// Export both for backward compatibility and new optimized version
export const AuthButtons = AuthButtonsOptimized;
export default AuthButtonsOptimized;