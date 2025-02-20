"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { TextBlock } from "@/components/BuilderBlocks/Text/TextBlock";
import { RecentFriendsBlock } from "@/components/BuilderBlocks/Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "@/components/BuilderBlocks/Activity/RecentActivityBlock/RecentActivityBlock";
import { GameLibraryBlock } from "@/components/BuilderBlocks/Games/GameLibraryBlock/GameLibraryBlock";
import { useFriends } from "@/hooks/Profile/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Block } from "@/components/BuilderBlocks/Block";
import { Sparkles } from "lucide-react";
import { useGameLibraryStore } from "@/stores/useGameLibraryStore";
import { useEffect } from "react";
import { JournalBlock } from "@/components/BuilderBlocks/Activity/Journal/JournalBlock";
import { ProfileCard } from "./ProfileCard";

interface AuthenticatedHomeProps {
  user: User;
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { activities, isLoading: isLoadingActivities } = useRecentActivities(5);
  const { stats, fetchGameLibrary } = useGameLibraryStore();

  useEffect(() => {
    fetchGameLibrary();
  }, [fetchGameLibrary]);

  // Get only the 5 most recent friends
  const recentFriends = friends.slice(0, 5);

  return (
    <Shell>
      <div className="container mx-auto space-y-8">
        <ProfileCard user={user} stats={stats} friends={friends.length} />

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 p-6">
          {/* Username ASCII Effect */}
          <div className="col-span-2">
            <Block variant="premium" hover={true} className="h-[180px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-purple-200/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      Welcome
                    </h3>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <TextBlock
                    text={user.email?.split("@")[0] || "Gamer"}
                    textFontSize={100}
                    asciiFontSize={1}
                    enableWaves={true}
                    textColor="#9333ea"
                    planeBaseHeight={6}
                    variant="ghost"
                  />
                </div>
              </div>
            </Block>
          </div>

          {/* Recent Friends Block */}
          <div className="col-span-2">
            <RecentFriendsBlock friends={recentFriends} size="sm" />
          </div>

          {/* Activity Block */}
          <div className="col-span-2">
            <RecentActivityBlock activities={activities} size="sm" />
          </div>

          {/* Game Library Block */}
          <div className="col-span-2">
            <GameLibraryBlock size="sm" />
          </div>

          {/* Journal Block */}
          <div className="col-span-2">
            <JournalBlock size="sm" />
          </div>
        </div>
      </div>
    </Shell>
  );
}
