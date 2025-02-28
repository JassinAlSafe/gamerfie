"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { useFriends } from "@/hooks/Profile/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useGameLibraryStore } from "@/stores/useGameLibraryStore";
import { useEffect } from "react";
import { ProfileCard } from "./ProfileCard";
import { BentoGrid } from "@/components/BuilderBlocks/BentoGrid/index";
import { useUser } from "@/hooks/User/useUser";
import { Activity } from "@/types/activity";

interface AuthenticatedHomeProps {
  user: User;
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  const { friends = [] } = useFriends();
  const { activities = [] } = useRecentActivities(5);
  const { stats, fetchGameLibrary } = useGameLibraryStore();
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (currentUser?.id) {
      fetchGameLibrary(currentUser.id);
    }
  }, [fetchGameLibrary, currentUser?.id]);

  // Get only the 5 most recent friends
  const recentFriends = friends.slice(0, 5);

  // Cast activities to the correct type
  const typedActivities = activities as unknown as Activity[];

  return (
    <Shell>
      <div className="container mx-auto max-w-[1400px]">
        <div className="space-y-4">
          <ProfileCard user={user} stats={stats} friends={friends.length} />
          <BentoGrid
            user={user}
            friends={recentFriends}
            activities={typedActivities}
          />
        </div>
      </div>
    </Shell>
  );
}
