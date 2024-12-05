"use client";

import { useProfile } from "../hooks/use-profile";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ProfileError } from "@/components/profile/profile-error";
import { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your profile
          </h1>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </div>
      );
    }
    return <ProfileError />;
  }

  if (!profile) {
    return <ProfileError />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileHeader profile={profile} onProfileUpdate={updateProfile} />
          <ProfileStats className="mt-6" stats={gameStats} />
        </div>
        <div className="md:col-span-2">
          <ProfileInfo profile={profile} onProfileUpdate={updateProfile} />
          <ProfileTabs userId={profile.id} className="mt-6" />
        </div>
      </div>
    </div>
  );
}
