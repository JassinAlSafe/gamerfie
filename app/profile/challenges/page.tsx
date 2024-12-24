"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Card } from "@/components/ui/card";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Users, Gamepad2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/use-profile";

export default function ProfileChallengesPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();
  const {
    userChallenges,
    fetchUserChallenges,
    isLoading: challengesLoading,
    error: challengesError,
  } = useChallengesStore();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check session and fetch challenges
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.access_token) {
          console.log("No valid session found, redirecting to login");
          router.push("/login");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(session.access_token);

        if (userError || !user?.id) {
          console.error("Error getting user:", userError);
          router.push("/login");
          return;
        }

        setIsSessionLoading(false);
        fetchUserChallenges(session);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionLoading(false);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router, fetchUserChallenges]);

  if (profileLoading || challengesLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">
          {profileError?.message || "Profile not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Hero Section with Gradient */}
      <div className="absolute inset-x-0 top-16 h-[300px] bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950" />

      {/* Main Content Container */}
      <div className="relative flex flex-col flex-grow">
        {/* Profile Header Section */}
        <div className="pt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileHeader
              profile={profile}
              stats={gameStats}
              onProfileUpdate={() => {}}
              minimal
            />
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/5 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <ProfileNav />
          </div>
        </div>

        {/* Challenges Content */}
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    My Challenges ({userChallenges.length})
                  </h2>
                </div>
                <Link href="/challenges">
                  <Button
                    variant="outline"
                    className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                  >
                    Find Challenges
                  </Button>
                </Link>
              </div>

              {/* Challenges Grid */}
              {challengesError ? (
                <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <div className="text-center space-y-2">
                    <p className="text-red-400">Error: {challengesError}</p>
                    <Button
                      variant="outline"
                      onClick={() => fetchUserChallenges()}
                      className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                    >
                      Try Again
                    </Button>
                  </div>
                </Card>
              ) : userChallenges.length === 0 ? (
                <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <div className="text-center space-y-2">
                    <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
                    <p className="text-gray-400">No challenges joined yet</p>
                    <p className="text-sm text-gray-500">
                      Join a challenge to start your gaming journey
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userChallenges.map((challenge) => (
                    <Link
                      key={challenge.id}
                      href={`/challenges/${challenge.id}`}
                      className="group"
                    >
                      <Card className="p-4 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                                {challenge.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                              >
                                {challenge.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {challenge.description}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Target className="w-4 h-4" />
                                <span>
                                  {challenge.goal_target}{" "}
                                  {challenge.goal_type.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>
                                  {challenge.participants_count} joined
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-purple-400">
                                  {challenge.participants?.[0]?.progress || 0}%
                                </span>
                              </div>
                              <Progress
                                value={
                                  challenge.participants?.[0]?.progress || 0
                                }
                                className="h-2"
                              />
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(
                                    new Date(challenge.end_date),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
