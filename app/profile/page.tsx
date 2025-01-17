"use client";

import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useEffect } from "react";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { activityIcons, activityText } from "@/lib/activity-constants";
import Image from "next/image";
import { getCoverImageUrl } from "@/utils/image-utils";
import { useJournalStore } from "@/stores/useJournalStore";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const { friends, activities, fetchFriends, fetchActivities } =
    useFriendsStore();
  const { entries, fetchEntries } = useJournalStore();
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      fetchFriends();
      fetchActivities();
      fetchEntries();
    }
  }, [profile, fetchFriends, fetchActivities, fetchEntries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-white">
            Please sign in to view your profile
          </h1>
          <Button
            onClick={() => router.push("/signin")}
            variant="default"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">Error: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p className="text-xl font-semibold">Profile not found</p>
      </div>
    );
  }

  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );
  const pendingFriends = friends.filter(
    (friend) => friend.status === "pending"
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

      {/* Main Content Container */}
      <div className="relative flex flex-col flex-grow">
        {/* Profile Header Section */}
        <div className="pt-8">
          <Toaster position="top-center" />
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={
                gameStats ?? {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
                }
              }
              onProfileUpdate={updateProfile}
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - About & Friends */}
              <div className="lg:col-span-1 space-y-8">
                {/* About Card */}
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-4">About</h2>
                  <p className="text-gray-300">
                    {profile.bio || "No bio provided yet"}
                  </p>
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Member since
                      </h3>
                      <p className="text-white">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Last active
                      </h3>
                      <p className="text-white">
                        {new Date(profile.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Friends Card */}
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Friends</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile/friends")}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">
                        {acceptedFriends.length}
                      </span>
                    </div>
                    {pendingFriends.length > 0 && (
                      <div className="text-sm text-yellow-400">
                        {pendingFriends.length} pending request
                        {pendingFriends.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {acceptedFriends.slice(0, 3).map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          {friend.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-white">
                            {friend.username}
                          </p>
                        </div>
                      </div>
                    ))}
                    {acceptedFriends.length === 0 && (
                      <p className="text-gray-400 text-sm">No friends yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Recent Activity */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Reviews */}
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Recent Reviews
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile/reviews")}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {entries
                      .filter((entry) => entry.type === "review")
                      .slice(0, 3)
                      .map((review) => (
                        <div
                          key={review.id}
                          className="group relative bg-gray-800/50 rounded-lg overflow-hidden"
                        >
                          {/* Game Cover Background */}
                          {review.game?.cover_url && (
                            <div className="absolute inset-0 opacity-10">
                              <Image
                                src={getCoverImageUrl(review.game.cover_url)}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw"
                                quality={10}
                              />
                            </div>
                          )}

                          <div className="relative p-4 flex gap-4">
                            {review.game && (
                              <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                <Image
                                  src={
                                    review.game.cover_url
                                      ? getCoverImageUrl(review.game.cover_url)
                                      : "/images/placeholders/game-cover.jpg"
                                  }
                                  alt={`Cover for ${review.game.name}`}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                  quality={90}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white line-clamp-1">
                                {review.game?.name}
                              </h3>
                              <div className="flex flex-col gap-2 mt-2">
                                {/* Rating Bars */}
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[...Array(10)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-1 h-4 rounded-sm ${
                                          i < (review.rating || 0)
                                            ? "bg-purple-500"
                                            : "bg-gray-700"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-white">
                                    {review.rating}/10
                                  </span>
                                </div>
                                {/* Progress Bar */}
                                {review.progress !== undefined &&
                                  review.progress !== null && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progress</span>
                                        <span>{review.progress}%</span>
                                      </div>
                                      <Progress
                                        value={review.progress}
                                        variant={
                                          review.progress >= 100
                                            ? "green"
                                            : review.progress >= 50
                                            ? "yellow"
                                            : "blue"
                                        }
                                      />
                                    </div>
                                  )}
                              </div>
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {review.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {entries.filter((entry) => entry.type === "review")
                      .length === 0 && (
                      <p className="text-gray-400">No reviews yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Recent Activity
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile/activity")}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                          {activity.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {activity.user.username}
                            </span>
                            {activityIcons[activity.type]}
                            <span className="text-gray-400">
                              {activityText[activity.type]}
                            </span>
                            <span className="text-purple-400">
                              {activity.game.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {activity.timestamp
                              ? formatDistanceToNow(
                                  new Date(activity.timestamp),
                                  {
                                    addSuffix: true,
                                  }
                                )
                              : "Just now"}
                          </p>
                          {activity.details &&
                            activity.type === "achievement" && (
                              <p className="mt-2 text-sm text-white">
                                🏆 Unlocked: {activity.details.name}
                              </p>
                            )}
                          {activity.details && activity.type === "review" && (
                            <p className="mt-2 text-sm text-white">
                              &ldquo;{activity.details.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p className="text-gray-400">
                        No recent activity to show.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
