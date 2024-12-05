"use client";

import { useState } from "react";
import { useProfile } from "@/app/hooks/use-profile";
import { ProfileHeader } from "./profile-header";
import { ProfileInfo } from "./profile-info";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";
import { ProfileError } from "./profile-error";
import { Toaster } from "react-hot-toast";
import { ProfileLoading } from "./profile-loading";

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error || !profile) {
    return <ProfileError />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileHeader profile={profile} />
          <ProfileStats className="mt-6" />
        </div>
        <div className="md:col-span-2">
          <ProfileInfo
            profile={profile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
          <ProfileTabs userId={profile.id} className="mt-6" />
        </div>
      </div>
    </div>
  );
}
