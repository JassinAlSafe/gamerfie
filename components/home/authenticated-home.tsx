"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { useFriends } from "@/hooks/Profile/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useEffect, useMemo, memo, Suspense, useRef, useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { FloatingActions } from "./FloatingActions";
import { BentoGrid } from "@/components/BuilderBlocks/BentoGrid/index";
import { GameProgressRing } from "@/components/BuilderBlocks/Games/GameProgressRing/GameProgressRing";
import { AchievementShowcase } from "@/components/BuilderBlocks/Games/AchievementShowcase/AchievementShowcase";
import { PlayStreaks } from "@/components/BuilderBlocks/Games/PlayStreaks/PlayStreaks";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBadges } from "@/hooks/Profile/useBadges";
import { usePlayStreaks } from "@/hooks/Activity/usePlayStreaks";
import { useWeeklyStats } from "@/hooks/Activity/useWeeklyStats";
import { QuickActionsCard } from "./QuickActionsCard";

interface AuthenticatedHomeProps {
  user: User;
}

const AuthenticatedHomeComponent = memo(function AuthenticatedHome({
  user,
}: AuthenticatedHomeProps) {
  const { friends = [], isLoading: friendsLoading } = useFriends();
  const { activities = [], isLoading: activitiesLoading } =
    useRecentActivities(5);
  const { stats, loading: statsLoading, fetchUserLibrary } = useLibraryStore();
  const { badges, recentBadges, totalBadges, isLoading: badgesLoading } = useBadges(user?.id);
  const { currentStreak, longestStreak, dailyActivity, lastPlayedDays, weeklyPlaytime, weeklyGamesPlayed: _weeklyGamesPlayed, isLoading: _streaksLoading } = usePlayStreaks(user?.id);
  const { gamesPlayed, hoursPlayed, friendsAdded, gamesPlayedChange, hoursPlayedChange, friendsAddedChange, isGamesPlayedPositive, isHoursPlayedPositive, isFriendsAddedPositive, isLoading: _weeklyStatsLoading } = useWeeklyStats(user?.id);

  // Stable loading state management
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const hasInitializedRef = useRef(false);

  // Fetch library only once when component mounts with user
  useEffect(() => {
    // Only fetch if we haven't initialized and have a user ID
    if (!hasInitializedRef.current && user?.id) {
      hasInitializedRef.current = true;
      fetchUserLibrary(user.id);
    }
  }, [user?.id, fetchUserLibrary]);

  // Manage stable loading state to prevent flickering
  useEffect(() => {
    const hasAnyData = !friendsLoading || !activitiesLoading || !statsLoading || !badgesLoading;

    if (hasAnyData && isInitialLoad) {
      // Once any data starts loading, mark as having data
      setHasDataLoaded(true);
    }

    // Only hide loading after ALL critical data is loaded
    if (!statsLoading && !badgesLoading && !isInitialLoad) {
      setIsInitialLoad(false);
    } else if (!statsLoading && !badgesLoading && hasDataLoaded) {
      // Set a small delay to prevent flickering
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    friendsLoading,
    activitiesLoading,
    statsLoading,
    badgesLoading,
    isInitialLoad,
    hasDataLoaded,
  ]);

  // Memoized calculations to prevent re-computation
  const recentFriends = useMemo(() => friends.slice(0, 5), [friends]);

  const typedActivities = useMemo(() => {
    return activities.filter((activity) =>
      Boolean(activity && activity.id && activity.created_at)
    );
  }, [activities]);

  const profileStats = useMemo(() => {
    // Calculate actual completed games from stats
    const completedGames =
      stats?.recentlyPlayed?.filter((game) => game.status === "completed")
        .length || 0;

    // Calculate average rating
    const gamesWithRatings =
      stats?.recentlyPlayed?.filter((game) => (game.rating || 0) > 0) || [];
    const averageRating =
      gamesWithRatings.length > 0
        ? gamesWithRatings.reduce((sum, game) => sum + (game.rating || 0), 0) /
          gamesWithRatings.length
        : 0;

    return {
      totalGames: stats?.totalGames || 0,
      completedGames,
      totalPlaytime: stats?.totalPlaytime || 0,
      averageRating,
    };
  }, [stats]);

  // Show skeleton only during initial load or if no data has been loaded yet
  if (isInitialLoad && !hasDataLoaded) {
    return (
      <Shell maxWidth="2xl" padding="md">
        <div className="space-y-8">
          <HomePageSkeleton />
        </div>
      </Shell>
    );
  }

  // Transform badges data for the AchievementShowcase component
  const achievementsData = badges.map(userBadge => ({
    id: userBadge.badge.id,
    name: userBadge.badge.name,
    description: userBadge.badge.description,
    rarity: userBadge.badge.rarity,
    unlockedAt: new Date(userBadge.claimed_at),
    isNew: userBadge.isNew || false
  }));

  return (
    <Shell maxWidth="7xl" padding="md">
      <div className="space-y-6">
        {/* Welcome Header */}
        <section className="relative">
          <WelcomeHeader
            user={user}
            totalGames={profileStats.totalGames}
            weeklyPlaytime={weeklyPlaytime}
            currentStreak={currentStreak}
          />
        </section>

        {/* Enhanced Dashboard Grid */}
        <section className="relative">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Main Widgets */}
            <div className="xl:col-span-2 space-y-4 md:space-y-6">
              {/* Profile Card */}
              <ProfileCard
                user={user}
                stats={profileStats}
                friends={friends}
                isLoading={statsLoading}
              />

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <GameProgressRing
                  completedGames={profileStats.completedGames}
                  totalGames={profileStats.totalGames}
                  totalPlaytime={weeklyPlaytime}
                  weeklyGoal={10}
                />
                <PlayStreaks
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  weeklyGoal={10}
                  weeklyProgress={weeklyPlaytime}
                  dailyActivity={dailyActivity}
                  lastPlayedDays={lastPlayedDays}
                />
              </div>

              {/* Main Dashboard */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
                  <div className="h-5 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                  Your Gaming Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your progress, connect with friends, and discover new games
                </p>
              </div>

              <ErrorBoundary fallback={<BentoGridFallback />}>
                <Suspense fallback={<BentoGridSkeleton />}>
                  <BentoGridStable
                    user={user}
                    friends={recentFriends}
                    activities={typedActivities}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Right Column - Secondary Widgets */}
            <div className="space-y-4 md:space-y-6">
              <AchievementShowcase
                achievements={achievementsData}
                totalAchievements={totalBadges}
                recentAchievements={recentBadges.map(userBadge => ({
                  id: userBadge.badge.id,
                  name: userBadge.badge.name,
                  description: userBadge.badge.description,
                  rarity: userBadge.badge.rarity,
                  unlockedAt: new Date(userBadge.claimed_at),
                  isNew: true
                }))}
              />

              {/* Quick Actions Card */}
              <QuickActionsCard />

              {/* Activity Summary */}
              <div className="p-6 rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  This Week
                </h3>
                <div className="space-y-4">
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Actions */}
        <FloatingActions />
      </div>
    </Shell>
  );
});

// Stable BentoGrid wrapper to prevent layout shifts
const BentoGridStable = memo(function BentoGridStable({
  user,
  friends,
  activities,
}: {
  user: User;
  friends: any[];
  activities: any[];
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <BentoGridSkeleton />;
  }

  return <BentoGrid user={user} friends={friends} activities={activities} />;
});

// Loading skeleton component for the whole page
const HomePageSkeleton = memo(function HomePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Section Skeleton */}
      <div className="border border-border/40 rounded-2xl p-6 bg-gradient-to-br from-card/80 to-card backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="mt-1.5 space-y-1">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-2 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Dashboard Section Skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <BentoGridSkeleton />
      </div>
    </div>
  );
});

// BentoGrid skeleton component
const BentoGridSkeleton = memo(function BentoGridSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
});

// BentoGrid error fallback
const BentoGridFallback = memo(function BentoGridFallback() {
  return (
    <div className="w-full rounded-xl border border-border/40 bg-gray-950/80 backdrop-blur-sm shadow-lg p-8">
      <div className="text-center space-y-4">
        <div className="text-muted-foreground">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">
            Dashboard Temporarily Unavailable
          </h3>
          <p className="text-sm">
            We're having trouble loading your dashboard. Please refresh the
            page.
          </p>
        </div>
      </div>
    </div>
  );
});

// Weekly Stat Component
const WeeklyStat = memo(function WeeklyStat({
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
});

export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  return <AuthenticatedHomeComponent user={user} />;
}
