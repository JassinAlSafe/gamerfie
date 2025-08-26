"use client";

import { User } from "@supabase/supabase-js";
import { Shell } from "@/app/layout/shell";
import { useFriends } from "@/hooks/Profile/useFriends";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useEffect, useMemo, memo, Suspense, useRef, useState, useCallback } from "react";
import { useStableLoadingState } from "@/hooks/useStableLoadingState";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ProfileCard } from "./ProfileCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { BentoGrid } from "@/components/BuilderBlocks/BentoGrid/index";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Friend } from "@/types/friend";

// Extended user settings type
interface UserSettings {
  onboarded?: boolean;
  theme?: string;
  notifications?: boolean;
  privacy?: string;
  [key: string]: any;
}

// Extended user type with typed profile
interface ExtendedUser extends User {
  profile?: {
    settings?: UserSettings | null;
    username?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    [key: string]: any;
  } | null;
}

// Types for the actual data being passed to components
interface ProcessedActivity {
  id: string;
  type: string;
  user_id: string;
  game_id: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
  game?: {
    name: string;
    coverImage: string | null;
  };
  details?: any;
  created_at: string;
}

interface AuthenticatedHomeProps {
  user: User;
}

const AuthenticatedHomeComponent = memo(function AuthenticatedHome({
  user,
}: AuthenticatedHomeProps) {
  const { friends = [], isLoading: friendsLoading } = useFriends();
  const { activities = [], isLoading: activitiesLoading } = useRecentActivities(5);
  const { stats, loading: statsLoading, fetchUserLibrary } = useLibraryStore();
  const router = useRouter();
  const { toast } = useToast();

  // Stable loading state management using custom hook
  const { isInitialLoad, hasDataLoaded } = useStableLoadingState([
    statsLoading,    // Most critical data first
    friendsLoading,
    activitiesLoading
  ]);
  const hasInitializedRef = useRef(false);

  // URL parameter validation functions
  const validateWelcomeParam = useCallback((param: string | null): boolean => {
    return param === "true";
  }, []);

  const validateAuthParam = useCallback((param: string | null): boolean => {
    return param === "success";
  }, []);

  // Check if this is a new user or if welcome parameter is set
  const [isWelcomeParam, setIsWelcomeParam] = useState(false);
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);

  useEffect(() => {
    // Only run on client side with proper validation
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        setIsWelcomeParam(validateWelcomeParam(params.get("welcome")));
        setIsAuthSuccess(validateAuthParam(params.get("auth")));
      } catch (error) {
        console.warn('Failed to parse URL parameters:', error);
        // Reset to safe defaults
        setIsWelcomeParam(false);
        setIsAuthSuccess(false);
      }
    }
  }, [validateWelcomeParam, validateAuthParam]);
  
  // Type-safe user onboarding status check
  const getUserOnboardingStatus = useCallback((user: User): boolean | undefined => {
    const extendedUser = user as ExtendedUser;
    if (extendedUser.profile?.settings && typeof extendedUser.profile.settings === 'object') {
      const settings = extendedUser.profile.settings as UserSettings;
      return settings.onboarded;
    }
    return undefined;
  }, []);

  const onboardedStatus = getUserOnboardingStatus(user);
  const isExplicitlyNotOnboarded = onboardedStatus === false;
  
  // Only show welcome for users who are explicitly not onboarded AND have the welcome param
  const isNewUser = isExplicitlyNotOnboarded && isWelcomeParam;

  // Handle welcome messages and URL cleanup
  useEffect(() => {
    if (isWelcomeParam || isAuthSuccess) {
      if (isWelcomeParam && isExplicitlyNotOnboarded) {
        // True new user coming from onboarding
        toast({
          title: "🎉 Welcome to GameVault!",
          description: "Your gaming adventure begins now. Start building your library!",
        });
      } else if (isAuthSuccess) {
        // Existing user signing in
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }

      // Clean up URL parameters
      router.replace("/", undefined);
    }
  }, [isWelcomeParam, isAuthSuccess, isExplicitlyNotOnboarded, router, toast]);

  // Memoized fetch library function to prevent unnecessary re-renders
  const fetchLibrary = useCallback(() => {
    if (user?.id && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchUserLibrary(user.id);
    }
  }, [user?.id, fetchUserLibrary]);

  // Fetch library only once when component mounts with user
  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Loading state is now managed by the useStableLoadingState hook

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


  return (
    <Shell maxWidth="7xl" padding="md">
      <div className="space-y-6">
        {/* Welcome Header */}
        <section className="relative">
          <WelcomeHeader
            user={user}
            totalGames={profileStats.totalGames}
            weeklyPlaytime={0}
            currentStreak={0}
            isNewUser={isNewUser}
          />
        </section>

        {/* Main Dashboard - BentoGrid Only */}
        <section className="relative">
          <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <ProfileCard
              user={user}
              stats={profileStats}
              friends={friends.length}
              isLoading={statsLoading}
            />

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
        </section>

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
  friends: Friend[];
  activities: ProcessedActivity[];
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <BentoGridSkeleton />;
  }

  return <BentoGrid user={user} friends={friends} activities={activities as any} />;
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


export function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  return <AuthenticatedHomeComponent user={user} />;
}
