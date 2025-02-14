"use client";

import { ProfileDropdown } from "../profile-dropdown";
import { AnimatedButton } from "../animated-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function AuthButtons() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signOut } = useAuthStore();

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
