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

  // Cast activities to the correct type with safety checks
  const typedActivities = activities.filter(
    (activity) => activity && activity.id && activity.created_at
  ) as unknown as Activity[];

  // Transform GameLibrary stats to ProfileCard stats format
  const profileStats = {
    totalGames: stats?.totalGames || 0,
    completedGames: 0, // We can calculate this from user games later
    totalPlaytime: stats?.totalPlaytime || 0,
    averageRating: 0, // We can calculate this from user games later
  };

  return (
    <Shell>
      <div className="container mx-auto max-w-[1400px]">
        <div className="space-y-4">
          <ProfileCard user={user} stats={profileStats} friends={friends} />
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
