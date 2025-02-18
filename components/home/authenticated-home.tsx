"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { TextBlock } from "@/components/BuilderBlocks/Text/TextBlock";
import { RecentFriendsBlock } from "@/components/BuilderBlocks/Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "@/components/BuilderBlocks/Activity/RecentActivityBlock/RecentActivityBlock";
import { GameLibraryBlock } from "@/components/BuilderBlocks/Games/GameLibraryBlock/GameLibraryBlock";
import { useFriends } from "@/hooks/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Block } from "@/components/BuilderBlocks/Block";
import {
  Trophy,
  Gamepad2,
  Sparkles,
  Clock,
  Users2,
  Target,
  Flame,
  Star,
  Calendar,
  Medal,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGameLibraryStore } from "@/stores/useGameLibraryStore";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { JournalBlock } from "@/components/BuilderBlocks/Activity/Journal/JournalBlock";

interface AuthenticatedHomeProps {
  user: User;
}

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  const username = user.email?.split("@")[0] || "Gamer";
  const { friends, isLoading: isLoadingFriends } = useFriends();
  const { activities, isLoading: isLoadingActivities } = useRecentActivities(5);
  const { stats, fetchGameLibrary } = useGameLibraryStore();

  useEffect(() => {
    fetchGameLibrary();
  }, [fetchGameLibrary]);

  // Get only the 5 most recent friends
  const recentFriends = friends.slice(0, 5);

  // Calculate mock level based on total playtime (1 level per 10 hours)
  const level = Math.floor(stats.totalPlaytime / 600);
  const nextLevelProgress = ((stats.totalPlaytime % 600) / 600) * 100;

  // Safely handle join date
  const joinDateString =
    user.created_at || user.updated_at || new Date().toISOString();
  const joinDate = new Date(joinDateString);
  const joinedText = user.created_at
    ? `Joined ${formatDistanceToNow(joinDate)} ago`
    : "New Player";

  return (
    <Shell>
      <div className="container mx-auto space-y-8">
        {/* Profile Card Section */}
        <div className="relative mt-8 px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 blur-3xl" />
          <div className="relative rounded-xl border border-purple-200/10 bg-background/80 backdrop-blur-sm shadow-2xl overflow-hidden">
            {/* Top Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.05)_25%,rgba(147,51,234,0.05)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.05)_75%)] bg-[length:8px_8px]" />

            <div className="relative p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-500/20 ring-offset-4 ring-offset-background">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl">
                      {username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border border-purple-200/10">
                    <Medal className="h-5 w-5 text-purple-500" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight">
                        {username}
                      </h1>
                      <div className="flex items-center gap-3">
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-purple-500" />
                          Level {level} Gamer
                        </p>
                        <span className="text-muted-foreground/40">•</span>
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          {joinedText}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-500 font-medium border border-purple-500/10">
                        {Math.round(stats.totalPlaytime / 60)}h played
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Gamepad2 className="h-4 w-4 text-purple-500" />
                        <span>Games</span>
                      </div>
                      <p className="text-2xl font-semibold">
                        {stats.totalGames}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users2 className="h-4 w-4 text-indigo-500" />
                        <span>Friends</span>
                      </div>
                      <p className="text-2xl font-semibold">{friends.length}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span>Achievements</span>
                      </div>
                      <p className="text-2xl font-semibold">142</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Target className="h-4 w-4 text-rose-500" />
                        <span>Completion</span>
                      </div>
                      <p className="text-2xl font-semibold">78%</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          Level {level} → {level + 1}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {nextLevelProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 p-[2px]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-in-out"
                        style={{ width: `${nextLevelProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
