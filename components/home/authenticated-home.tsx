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
      <Shell maxWidth="6xl" padding="lg">
        <div className="space-y-8">
          <HomePageSkeleton />
        </div>
      </Shell>
    );
  }

  return (
    <Shell maxWidth="6xl" padding="lg">
      <div className="space-y-8">
        {/* Profile Card */}
        <ProfileCard
          user={user}
          stats={profileStats}
          friends={friends.length}
          isLoading={statsLoading}
        />

        {/* Dashboard Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Your gaming activity and progress
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
      {/* Welcome Header Skeleton */}
      <div className="border border-border/20 rounded-xl bg-card/30 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="text-right">
            <Skeleton className="w-12 h-7 mb-1" />
            <Skeleton className="w-12 h-4" />
          </div>
        </div>
      </div>

      {/* Profile Section Skeleton */}
      <div className="border border-border/20 rounded-xl bg-card/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-right space-y-1">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border/20 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* Dashboard Section Skeleton */}
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <BentoGridSkeleton />
      </div>
    </div>
  );
});

// BentoGrid skeleton component
const BentoGridSkeleton = memo(function BentoGridSkeleton() {
  return (
    <div className="w-full rounded-xl border border-border/20 bg-card/30 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
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
