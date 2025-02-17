"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { TextBlock } from "@/components/BuilderBlocks/Text/TextBlock";
import { RecentFriendsBlock } from "@/components/BuilderBlocks/Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "@/components/BuilderBlocks/Activity/RecentActivityBlock/RecentActivityBlock";
import { useFriends } from "@/hooks/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Block } from "@/components/BuilderBlocks/Block";
import { Trophy, Gamepad2, Sparkles } from "lucide-react";

interface AuthenticatedHomeProps {
  user: User;
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  const username = user.email?.split("@")[0] || "Gamer";
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { activities, isLoading: isLoadingActivities } = useRecentActivities(5);

  // Get only the 5 most recent friends
  const recentFriends = friends.slice(0, 5);

  return (
    <Shell>
      <div className="container mx-auto space-y-8">
        {/* Header Section */}
        <div className="ml-10 mt-12 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-purple-500">{username}</span>!
          </h1>
          <p className="text-muted-foreground">
            Your gaming journey continues here.
          </p>
        </div>

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
                    text={username}
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

          {/* Achievements Block */}
          <div className="col-span-3">
            <Block
              size="sm"
              variant="premium"
              hover={true}
              className="h-[180px]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-purple-200/10">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      Latest Achievements
                    </h3>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </div>
            </Block>
          </div>

          {/* Featured Game Block */}
          <div className="col-span-3">
            <Block
              size="sm"
              variant="default"
              hover={true}
              className="h-[180px]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Featured Game</h3>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </div>
            </Block>
          </div>
        </div>
      </div>
    </Shell>
  );
}
