"use client";

import { ProfileDropdown } from "../profile/profile-dropdown";
import { AnimatedButton } from "../animated-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

export const AuthButtons = React.memo(function AuthButtons() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signOut, isInitialized } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
      toast({
        title: "Signed out",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!isInitialized) {
    return null; // Don't render anything while initializing
  }

  if (user) {
    return <ProfileDropdown user={user} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex items-center gap-3">
      <AnimatedButton
        variant="ghost"
        size="default"
        glowColor="gray"
        onClick={() => router.push("/signin")}
        className="text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Sign in to your account"
      >
        Sign In
      </AnimatedButton>
      <AnimatedButton
        variant="default"
        size="default"
        glowColor="purple"
        onClick={() => router.push("/signup")}
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label="Create a new account"
      >
        Sign Up
      </AnimatedButton>
    </div>
  );
});
