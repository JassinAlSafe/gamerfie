"use client";

import { useState } from "react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileMainContent } from "@/components/profile/ProfileMainContent";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    userId: "user_id",
    username: "username",
    avatarUrl: null,
    stats: {
      totalGames: 0,
      totalReviews: 0,
      completedGames: 0,
    },
  });

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, avatarUrl: url }));
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <ProfileSidebar
          userId={profile.userId}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          stats={profile.stats}
          onAvatarUpdate={handleAvatarUpdate}
        />
        <ProfileMainContent username={profile.username} />
      </div>
    </div>
  );
}