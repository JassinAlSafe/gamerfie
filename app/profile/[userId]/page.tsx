
"use client";

import { useProfile } from "@/app/hooks/use-profile";
import { ProfileContent } from "@/components/profile/profile-content";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile(
    params.userId
  );
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
          <h1 className="text-3xl font-bold mb-6">
            Please sign in to view your profile
          </h1>
          <Button
            onClick={() => router.push("/signin")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-center" />
      <ProfileContent
        profile={profile}
        gameStats={gameStats}
        updateProfile={updateProfile}
      />
      <div className="container mx-auto px-4 py-6">
        <ProfileTabs userId={params.userId} />
      </div>
    </div>
  );
}