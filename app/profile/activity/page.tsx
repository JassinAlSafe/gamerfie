"use client";

import React from "react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { FriendActivityFeed } from "@/components/friends/friend-activity-feed";
import LoadingSpinner from "@/components/loadingSpinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function ActivityPage() {
  const { profile, isLoading, error, gameStats } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950 text-red-500">
        <p className="text-xl font-semibold">Error: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950 text-white">
        <p className="text-xl font-semibold">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

        {/* Profile Content */}
        <div className="relative">
          <Toaster position="top-center" />
          {/* Profile Info and Stats */}
          <div className="max-w-7xl mx-auto px-4 pt-8">
            <ProfileHeader
              profile={profile}
              stats={
                gameStats ?? {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
                }
              }
              onProfileUpdate={() => {}}
            />
          </div>

          {/* Navigation */}
          <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
            <div className="max-w-7xl mx-auto px-4">
              <ProfileNav />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                <FriendActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
