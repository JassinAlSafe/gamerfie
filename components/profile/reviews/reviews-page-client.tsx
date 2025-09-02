"use client";

import { useProfile } from "@/hooks/Profile/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileReviewsClient } from "@/components/profile/reviews/ProfileReviewsClient";
import LoadingSpinner from "@/components/loadingSpinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function ReviewsPageClient() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-white">
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
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">Error: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p className="text-xl font-semibold">Profile not found</p>
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
          <Toaster position="top-center" />
          <ProfileHeader
            profile={profile}
            stats={
              (gameStats as any) ?? {
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
      <div className="bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <ProfileNav />
      </div>

      {/* Reviews Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ProfileReviewsClient />
        </div>
      </div>
    </div>
  );
}
