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

export default function ProfilePage() {
  const { profile, isLoading, error, gameStats, updateProfile } = useProfile();
  const { friends, activities, fetchFriends, fetchActivities } =
    useFriendsStore();
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      fetchFriends();
      fetchActivities();
    }
  }, [profile, fetchFriends, fetchActivities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    if (error.message === "No authenticated user") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950 text-red-500">
        <p className="text-xl font-semibold">Error: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] pt-16 bg-gray-950 text-white">
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pt-16 bg-gray-950">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

        {/* Profile Content */}
        <div className="relative">
          <Toaster position="top-center" />
          {/* Profile Info and Stats */}
          <div className="max-w-7xl mx-auto px-4 pt-8">
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

          {/* Navigation */}
          <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
            <div className="max-w-7xl mx-auto px-4">
              <ProfileNav />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - About & Friends */}
                <div className="lg:col-span-1 space-y-8">
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
                            <p className="font-medium truncate">
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
                <div className="lg:col-span-2">
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
                        <div
                          key={activity.id}
                          className="flex items-start gap-4"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            {activity.user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white">
                              <span className="font-medium">
                                {activity.user.username}
                              </span>{" "}
                              {activity.activity_type === "started_playing" &&
                                "started playing"}
                              {activity.activity_type === "completed" &&
                                "completed"}
                              {activity.activity_type === "achievement" &&
                                "unlocked an achievement in"}
                              {activity.activity_type === "review" &&
                                "reviewed"}{" "}
                              <span className="text-purple-400">
                                {activity.game.name}
                              </span>
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(
                                activity.created_at
                              ).toLocaleDateString()}
                            </p>
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
    </div>
  );
}
