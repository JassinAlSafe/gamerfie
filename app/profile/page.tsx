"use client";

import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";

export default function ProfilePage() {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
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
              stats={gameStats ?? { total_played: 0, played_this_year: 0, backlog: 0 }}
              onProfileUpdate={updateProfile}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - About */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">About</h2>
                    <p className="text-gray-300">
                      {profile.bio || "No bio provided yet"}
                    </p>
                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Member since</h3>
                        <p className="text-white">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">Last active</h3>
                        <p className="text-white">
                          {new Date(profile.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    <div className="space-y-6">
                      {/* Placeholder for activity items */}
                      <p className="text-gray-400">No recent activity to show.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
