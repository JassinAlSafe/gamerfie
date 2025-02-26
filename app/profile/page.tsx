"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useProfile } from "@/hooks/Profile/use-profile";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useJournalStore } from "@/stores/useJournalStore";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Gamepad2,
  BookText,
  Users,
  Star,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import type { GameStats } from "@/types/user";
import type { Profile } from "@/types/profile";
import type { FriendActivity } from "@/types/activity";
import type { JournalEntry } from "@/types/journal";
import type { Friend } from "@/types/friend";
// Import Card components directly to avoid linter errors
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load the ProfileActions component
const ProfileActionsComponent = lazy(() =>
  import("@/components/profile/profile-actions").then((mod) => ({
    default: mod.ProfileActions,
  }))
);

// Define proper interfaces for component props
interface ProfileSectionProps {
  children: React.ReactNode;
  isLoading: boolean;
  section: string;
}

interface SectionErrorFallbackProps {
  section: string;
}

// Type guard for checking if gameStats is valid
function isValidGameStats(stats: unknown): stats is GameStats {
  return (
    stats !== null &&
    typeof stats === "object" &&
    "total_played" in stats &&
    typeof stats.total_played === "number"
  );
}

// Type guard for checking if activity has required properties
function isValidActivity(activity: FriendActivity): boolean {
  return (
    activity !== null &&
    typeof activity === "object" &&
    "id" in activity &&
    "type" in activity &&
    "created_at" in activity &&
    "user" in activity &&
    activity.user !== null &&
    typeof activity.user === "object" &&
    "username" in activity.user &&
    "game" in activity &&
    activity.game !== null &&
    typeof activity.game === "object" &&
    "name" in activity.game
  );
}

// Error fallback component for section errors
const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({
  section,
}) => (
  <Card className="bg-gray-900/50 border-red-800/30 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl text-white flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        {section} Error
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300">
        There was an error loading this section. Please try refreshing the page.
      </p>
    </CardContent>
  </Card>
);

// Fallback component for content loading
const CardSkeleton: React.FC = () => (
  <div className="rounded-lg bg-gray-900/50 border border-gray-800 animate-pulse">
    <div className="h-12 border-b border-gray-800"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

// Wrapper component with error handling
const ProfileSection: React.FC<ProfileSectionProps> = ({
  children,
  isLoading,
  section,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // Reset error state when loading state changes
    if (isLoading) {
      setHasError(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (hasError) {
    return <SectionErrorFallback section={section} />;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    setHasError(true);
    console.error(`Error in ${section} section:`, error);
    return <SectionErrorFallback section={section} />;
  }
};

// Utility function for throttling
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Utility function for debouncing
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Search input component
interface SearchInputProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  onFocusChange: (focus: "all" | "journal" | "activities") => void;
  searchFocus: "all" | "journal" | "activities";
  value: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  onFocusChange,
  searchFocus,
  value,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    onClear();
  };

  return (
    <div className="mb-6 space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search your content..."
          value={inputValue}
          onChange={handleChange}
          className="pl-10 pr-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Tabs
        value={searchFocus}
        onValueChange={(value) =>
          onFocusChange(value as "all" | "journal" | "activities")
        }
        className="w-full"
      >
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-800">
            All
          </TabsTrigger>
          <TabsTrigger
            value="journal"
            className="data-[state=active]:bg-gray-800"
          >
            Journal
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-gray-800"
          >
            Activities
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default function ProfilePage(): JSX.Element {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const {
    friends,
    fetchFriends,
    isLoading: friendsLoading,
  } = useFriendsStore();
  const {
    activities,
    fetchActivities,
    isLoading: activitiesLoading,
  } = useFriendsStore();
  const {
    entries,
    fetchEntries,
    isLoading: journalLoading,
  } = useJournalStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocus, setSearchFocus] = useState<
    "all" | "journal" | "activities"
  >("all");

  // Memoize tabs to prevent recreation on each render - MOVED UP before any conditional returns
  const tabs = useMemo(
    () => [
      { value: "overview", label: "Overview" },
      { value: "games", label: "Games", href: "/profile/games" },
      { value: "journal", label: "Journal", href: "/profile/journal" },
      { value: "friends", label: "Friends", href: "/profile/friends" },
      { value: "reviews", label: "Reviews", href: "/profile/reviews" },
    ],
    []
  );

  // Optimize data fetching with sequential loading and debounce
  useEffect(() => {
    // Skip if data is already loaded or loading is in progress
    if (
      isDataLoaded ||
      isLoading ||
      friendsLoading ||
      activitiesLoading ||
      journalLoading
    ) {
      return;
    }

    // Sequential data loading with debounce to prevent multiple API calls
    const loadData = async () => {
      try {
        // Step 1: Load friends data first (most important)
        if (!friends.length) {
          await fetchFriends();
        }

        // Step 2: Load activities after a small delay
        setTimeout(async () => {
          if (!activities.length) {
            await fetchActivities();
          }

          // Step 3: Load journal entries last
          setTimeout(async () => {
            if (!entries.length) {
              await fetchEntries();
            }
            setIsDataLoaded(true);
          }, 300);
        }, 300);
      } catch (error) {
        console.error("Error loading profile data:", error);
        setIsDataLoaded(true); // Mark as loaded even on error to prevent infinite retries
      }
    };

    loadData();
  }, [
    isDataLoaded,
    isLoading,
    friendsLoading,
    activitiesLoading,
    journalLoading,
    friends.length,
    activities.length,
    entries.length,
    fetchFriends,
    fetchActivities,
    fetchEntries,
  ]);

  // Throttled event handlers to prevent rapid clicks
  const handleEditProfile = useCallback(
    throttle(() => {
      router.push("/profile/edit");
    }, 300),
    [router]
  );

  const handleSettings = useCallback(
    throttle(() => {
      router.push("/settings");
    }, 300),
    [router]
  );

  const handleTabChange = useCallback(
    throttle((tab: string) => {
      setActiveTab(tab);
    }, 200),
    []
  );

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // Filtered data based on search query
  const filteredJournalEntries = useMemo<JournalEntry[]>(() => {
    if (!searchQuery || searchFocus === "activities") return entries;

    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.game?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery, searchFocus]);

  const filteredActivities = useMemo<FriendActivity[]>(() => {
    if (!searchQuery || searchFocus === "journal") return activities;

    return activities.filter(
      (activity) =>
        isValidActivity(activity) &&
        (activity.game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.user.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (activity.details?.comment &&
            activity.details.comment
              .toLowerCase()
              .includes(searchQuery.toLowerCase())))
    );
  }, [activities, searchQuery, searchFocus]);

  // Memoize calculated stats to prevent recalculation on each render
  const totalGames = useMemo<number>(
    () => (isValidGameStats(gameStats) ? gameStats.total_played : 0),
    [gameStats]
  );

  const acceptedFriends = useMemo<Friend[]>(
    () => friends.filter((friend) => friend.status === "accepted"),
    [friends]
  );

  const recentReviews = useMemo<JournalEntry[]>(
    () =>
      filteredJournalEntries
        .filter((entry) => entry.type === "review")
        .slice(0, 3),
    [filteredJournalEntries]
  );

  const recentActivities = useMemo<FriendActivity[]>(
    () => filteredActivities.slice(0, 5),
    [filteredActivities]
  );

  const recentJournalEntries = useMemo<JournalEntry[]>(
    () => filteredJournalEntries.slice(0, 3),
    [filteredJournalEntries]
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  // Render error state
  if (error || !profile || !gameStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={error?.message || "Profile not found"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            stats={gameStats as GameStats}
            onProfileUpdate={updateProfile}
          />
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <ProfileNav />
      </div>

      {/* Profile Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Profile Overview</h2>
            <ProfileActions
              onEdit={handleEditProfile}
              onSettings={handleSettings}
            />
          </div>

          {activeTab === "overview" && (
            <SearchInput
              onSearch={handleSearch}
              onClear={() => setSearchQuery("")}
              onFocusChange={setSearchFocus}
              searchFocus={searchFocus}
              value={searchQuery}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - About */}
            <div className="md:col-span-2 space-y-6">
              <ProfileSection isLoading={isLoading} section="About">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      {profile.bio ||
                        "No bio provided yet. Click 'Edit Profile' to add one!"}
                    </p>
                  </CardContent>
                </Card>
              </ProfileSection>

              {/* Recent Activity */}
              <ProfileSection isLoading={activitiesLoading} section="Activity">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-purple-400" />
                      Recent Activity
                    </CardTitle>
                    <Link
                      href="/activity"
                      className="text-sm text-purple-400 hover:underline"
                    >
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recentActivities.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivities.map(
                          (activity) =>
                            isValidActivity(activity) && (
                              <div
                                key={activity.id}
                                className="border-b border-gray-800 pb-3 last:border-0"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                                    {activity.game.cover_url ? (
                                      <img
                                        src={activity.game.cover_url}
                                        alt={activity.game.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        {activity.game.name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white">
                                      <span className="font-medium">
                                        {activity.user.username}
                                      </span>{" "}
                                      {activity.type === "started_playing" &&
                                        "started playing"}
                                      {activity.type === "completed" &&
                                        "completed"}
                                      {activity.type === "review" && "reviewed"}
                                      {activity.type === "progress" &&
                                        "made progress in"}
                                      {activity.type === "achievement" &&
                                        "unlocked an achievement in"}{" "}
                                      <span className="font-medium">
                                        {activity.game.name}
                                      </span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        activity.created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        {searchQuery
                          ? "No activities match your search."
                          : "No recent activity. Start playing games to see activity here!"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ProfileSection>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Games */}
              <ProfileSection isLoading={isLoading} section="Games">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white">Games</CardTitle>
                    <Link href="/profile/games">
                      <Button
                        variant="link"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        View All
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 p-2 rounded-full">
                          <Gamepad2 className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="text-gray-300">Total Games</span>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {totalGames}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </ProfileSection>

              {/* Friends */}
              <ProfileSection isLoading={friendsLoading} section="Friends">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      Friends
                    </CardTitle>
                    <Link
                      href="/friends"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {acceptedFriends.length > 0 ? (
                      <div className="space-y-4">
                        {acceptedFriends.slice(0, 3).map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                              {friend.avatar_url ? (
                                <img
                                  src={friend.avatar_url}
                                  alt={friend.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  {friend.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                {friend.username}
                              </p>
                              <p className="text-sm text-gray-400">
                                {friend.online_status === "online" ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-green-400">
                                      Online
                                    </span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    <span>Offline</span>
                                  </span>
                                )}
                              </p>
                            </div>
                            <Link
                              href={`/profile/${friend.id}`}
                              className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                        {acceptedFriends.length > 3 && (
                          <div className="text-center pt-2">
                            <Link
                              href="/friends"
                              className="text-sm text-blue-400 hover:underline"
                            >
                              +{acceptedFriends.length - 3} more friends
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 mb-3">No friends yet.</p>
                        <Link href="/friends/find">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-900/30 text-blue-400 border-blue-800 hover:bg-blue-900/50"
                          >
                            Find Friends
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ProfileSection>

              {/* Reviews */}
              <ProfileSection isLoading={journalLoading} section="Reviews">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      Recent Reviews
                    </CardTitle>
                    <Link
                      href="/profile/journal"
                      className="text-sm text-yellow-400 hover:underline"
                    >
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recentReviews.length > 0 ? (
                      <div className="space-y-4">
                        {recentReviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-gray-800 pb-3 last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                                {review.game?.cover_url ? (
                                  <img
                                    src={review.game.cover_url}
                                    alt={review.game.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    {review.game?.name
                                      .charAt(0)
                                      .toUpperCase() || "?"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-white">
                                    {review.game?.name || "Unknown Game"}
                                  </p>
                                  {review.rating && (
                                    <span className="text-sm bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded">
                                      {review.rating}/10
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                                  {review.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        {searchQuery
                          ? "No reviews match your search."
                          : "No reviews yet. Write a review to see it here!"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ProfileSection>

              {/* Journal */}
              <ProfileSection isLoading={journalLoading} section="Journal">
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <BookText className="h-5 w-5 text-green-400" />
                      Journal
                    </CardTitle>
                    <Link
                      href="/profile/journal"
                      className="text-sm text-green-400 hover:underline"
                    >
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recentJournalEntries.length > 0 ? (
                      <div className="space-y-4">
                        {recentJournalEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="border-b border-gray-800 pb-3 last:border-0"
                          >
                            <p className="font-medium text-white">
                              {entry.title}
                            </p>
                            <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                              {entry.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                                {entry.type === "progress" && "Progress"}
                                {entry.type === "review" && "Review"}
                                {entry.type === "daily" && "Daily"}
                                {entry.type === "list" && "List"}
                                {entry.type === "note" && "Note"}
                                {entry.type === "achievement" && "Achievement"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        {searchQuery
                          ? "No journal entries match your search."
                          : "No journal entries yet. Start journaling to see entries here!"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </ProfileSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
