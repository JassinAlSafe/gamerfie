"use client";

import { ProfileDropdown } from "../profile/profile-dropdown";
import { AnimatedButton } from "../animated-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export function AuthButtons() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signOut, initialize, isInitialized } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized && !hasInitialized) {
        setHasInitialized(true);
        await initialize();
      }
    };

    initAuth();
  }, [initialize, isInitialized, hasInitialized]);

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
    <div className="flex items-center space-x-4">
      <AnimatedButton variant="ghost" onClick={() => router.push("/signin")}>
        Sign In
      </AnimatedButton>
      <AnimatedButton onClick={() => router.push("/signup")}>
        Sign Up
      </AnimatedButton>
    </div>
  );
}
