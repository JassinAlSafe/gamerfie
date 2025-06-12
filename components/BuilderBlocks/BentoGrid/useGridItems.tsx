"use client";

import { User } from "@supabase/supabase-js";
import { useMemo } from "react";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Friend } from "@/types/friend";
import { Activity } from "@/types/activity";
import { Block } from "../Block";
import { RecentFriendsBlock } from "../Friends/RecentFriendsBlock/RecentFriendsBlock";
import { RecentActivityBlock } from "../Activity/RecentActivityBlock/RecentActivityBlock";
import { GameLibraryBlock } from "../Games/GameLibraryBlock/GameLibraryBlock";
import { AchievementShowcase } from "../Games/AchievementShowcase/AchievementShowcase";
import { GameProgressRing } from "../Games/GameProgressRing/GameProgressRing";
import { PlayStreaks } from "../Games/PlayStreaks/PlayStreaks";
import { JournalBlock } from "../Activity/Journal/JournalBlock";
import { GridItem, WIDGET_CONSTRAINTS } from "./constants";
import { cn } from "@/lib/utils";
import { useBadges } from "@/hooks/Profile/useBadges";
import { usePlayStreaks } from "@/hooks/Activity/usePlayStreaks";
import { useWeeklyStats } from "@/hooks/Activity/useWeeklyStats";
import { useLibraryStore } from "@/stores/useLibraryStore";

interface UseGridItemsProps {
  user: User;
  friends: Friend[];
  activities: Activity[];
}

export function useGridItems({ user, friends, activities }: UseGridItemsProps) {
  // Get data from hooks
  const { badges, recentBadges, totalBadges } = useBadges(user?.id);
  const { currentStreak, longestStreak, dailyActivity, lastPlayedDays, weeklyPlaytime } = usePlayStreaks(user?.id);
  const { gamesPlayed, hoursPlayed, friendsAdded, gamesPlayedChange, hoursPlayedChange, friendsAddedChange, isGamesPlayedPositive, isHoursPlayedPositive, isFriendsAddedPositive } = useWeeklyStats(user?.id);
  const { stats } = useLibraryStore();

  return useMemo(() => {
    // Calculate profile stats
    const completedGames = stats?.recentlyPlayed?.filter((game) => game.status === "completed").length || 0;
    const totalGames = stats?.totalGames || 0;

    // Transform badges data for the AchievementShowcase component
    const achievementsData = badges.map(userBadge => ({
      id: userBadge.badge.id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      rarity: userBadge.badge.rarity,
      unlockedAt: new Date(userBadge.claimed_at),
      isNew: userBadge.isNew || false
    }));

    const recentAchievementsData = recentBadges.map(userBadge => ({
      id: userBadge.badge.id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      rarity: userBadge.badge.rarity,
      unlockedAt: new Date(userBadge.claimed_at),
      isNew: true
    }));

    const items: GridItem[] = [
      {
        id: "welcome",
        type: "welcome",
        title: "Welcome",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.welcome.w,
        h: WIDGET_CONSTRAINTS.welcome.h,
        component: (
          <Block
            variant="premium"
            hover={true}
            className="h-full overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 border-b border-purple-200/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    Welcome
                  </h3>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-center">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    {user.email?.split("@")[0] || "Gamer"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ready to game?
                  </p>
                </div>
              </div>
            </div>
          </Block>
        ),
      },
      {
        id: "friends",
        type: "friends",
        title: "Recent Friends",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.friends.w,
        h: WIDGET_CONSTRAINTS.friends.h,
        component: <RecentFriendsBlock friends={friends} className="h-full" />,
      },
      {
        id: "activity",
        type: "activity",
        title: "Recent Activity",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.activity.w,
        h: WIDGET_CONSTRAINTS.activity.h,
        component: (
          <RecentActivityBlock activities={activities} className="h-full" />
        ),
      },
      {
        id: "library",
        type: "library",
        title: "Game Library",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.library.w,
        h: WIDGET_CONSTRAINTS.library.h,
        component: <GameLibraryBlock className="h-full" />,
      },
      {
        id: "achievements",
        type: "achievements",
        title: "Achievement Showcase",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.achievements.w,
        h: WIDGET_CONSTRAINTS.achievements.h,
        component: (
          <AchievementShowcase
            achievements={achievementsData}
            totalAchievements={totalBadges}
            recentAchievements={recentAchievementsData}
            className="h-full"
          />
        ),
      },
      {
        id: "progress",
        type: "progress",
        title: "Game Progress",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.progress.w,
        h: WIDGET_CONSTRAINTS.progress.h,
        component: (
          <GameProgressRing
            completedGames={completedGames}
            totalGames={totalGames}
            totalPlaytime={weeklyPlaytime}
            weeklyGoal={10}
            className="h-full"
          />
        ),
      },
      {
        id: "streaks",
        type: "streaks",
        title: "Play Streaks",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.streaks.w,
        h: WIDGET_CONSTRAINTS.streaks.h,
        component: (
          <PlayStreaks
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            weeklyGoal={10}
            weeklyProgress={weeklyPlaytime}
            dailyActivity={dailyActivity}
            lastPlayedDays={lastPlayedDays}
            className="h-full"
          />
        ),
      },
      {
        id: "journal",
        type: "journal",
        title: "Journal",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.journal.w,
        h: WIDGET_CONSTRAINTS.journal.h,
        component: <JournalBlock className="h-full" />,
      },
      {
        id: "weeklyStats",
        type: "weeklyStats",
        title: "This Week",
        icon: <Sparkles className="h-4 w-4" />,
        w: WIDGET_CONSTRAINTS.weeklyStats.w,
        h: WIDGET_CONSTRAINTS.weeklyStats.h,
        component: (
          <Block
            variant="default"
            hover={true}
            className="h-full p-4"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  <h3 className="font-semibold text-foreground">This Week</h3>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent pr-1">
                <div className="space-y-3">
                  <WeeklyStat
                    label="Games Played"
                    value={gamesPlayed}
                    change={gamesPlayedChange}
                    isPositive={isGamesPlayedPositive}
                  />
                  <WeeklyStat
                    label="Hours Played"
                    value={hoursPlayed}
                    change={hoursPlayedChange}
                    isPositive={isHoursPlayedPositive}
                  />
                  <WeeklyStat
                    label="Friends Added"
                    value={friendsAdded}
                    change={friendsAddedChange}
                    isPositive={isFriendsAddedPositive}
                  />
                  <WeeklyStat
                    label="Achievements Earned"
                    value={12}
                    change="+5"
                    isPositive={true}
                  />
                  <WeeklyStat
                    label="Reviews Written"
                    value={3}
                    change="+2"
                    isPositive={true}
                  />
                </div>
              </div>
            </div>
          </Block>
        ),
      },
    ];
    return items;
  }, [user.email, friends, activities, badges, recentBadges, totalBadges, currentStreak, longestStreak, dailyActivity, lastPlayedDays, weeklyPlaytime, gamesPlayed, hoursPlayed, friendsAdded, gamesPlayedChange, hoursPlayedChange, friendsAddedChange, isGamesPlayedPositive, isHoursPlayedPositive, isFriendsAddedPositive, stats]);
}

// Weekly Stat Component
const WeeklyStat = function WeeklyStat({
  label,
  value,
  change,
  isPositive
}: {
  label: string;
  value: number;
  change: string;
  isPositive: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        isPositive 
          ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" 
          : "text-red-600 bg-red-100 dark:bg-red-900/30"
      )}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{change}</span>
      </div>
    </div>
  );
};