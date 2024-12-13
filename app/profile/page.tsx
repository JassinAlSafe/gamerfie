"use client";

import { useProfile } from "@/hooks/use-profile";
import { ProfileContent } from "@/components/profile/profile-content";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";

export default function ProfilePage() {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 pt-16">
          <h1 className="text-3xl font-bold mb-6">
            Please sign in to view your profile
          </h1>
          <Button
            onClick={() => router.push("/signin")}
            variant="default"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-red-500 pt-16">
        <p className="text-xl font-semibold">Error: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white pt-16">
        <p className="text-xl font-semibold">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Toaster position="top-center" />
      <ProfileContent
        profile={profile}
        gameStats={gameStats ?? { total_played: 0, played_this_year: 0, backlog: 0 }}
        updateProfile={updateProfile}
      />
    </div>
  );
}
