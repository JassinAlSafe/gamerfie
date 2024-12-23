"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Card } from "@/components/ui/card";
import { useChallengesStore } from "@/store/challenges";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Users, Gamepad2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function ProfileChallengesPage() {
  const { userChallenges, fetchUserChallenges, isLoading, error } =
    useChallengesStore();
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // First check for session
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

        // Get user from session
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(session.access_token);

        if (userError || !user?.id) {
          console.error("Error getting user:", userError);
          router.push("/login");
          return;
        }

        // Create a complete session object with user
        const completeSession = {
          ...session,
          user,
        };

        console.log("Session and user found:", {
          session: completeSession,
          user,
        });
        setIsSessionLoading(false);
        // Pass the complete session to fetchUserChallenges
        fetchUserChallenges(completeSession);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSessionLoading(false);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router, fetchUserChallenges]);

  // Log state changes
  useEffect(() => {
    console.log("User challenges updated:", userChallenges);
    console.log("Loading state:", isLoading);
    console.log("Session loading:", isSessionLoading);
    console.log("Error state:", error);
  }, [userChallenges, isLoading, isSessionLoading, error]);

  // All challenges where the user is a participant are shown
  const activeChallenges = userChallenges;

  // Show loading state while checking session or fetching challenges
  if (isSessionLoading || isLoading) {
    return (
      <main className="relative min-h-screen pt-20 pb-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <BackgroundBeams className="opacity-20" />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          <p className="text-gray-400">Loading your challenges...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-20 pb-10 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <BackgroundBeams className="opacity-20" />
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            My Challenges
          </h1>
          <p className="text-gray-400">
            Track your progress in gaming challenges
          </p>
        </div>

        {/* Active Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold">
                My Challenges ({activeChallenges.length})
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

          {error ? (
            <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <p className="text-red-400">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchUserChallenges()}
                  className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                >
                  Try Again
                </Button>
              </div>
            </Card>
          ) : activeChallenges.length === 0 ? (
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
              {activeChallenges.map((challenge) => (
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
                            <span>{challenge.participants_count} joined</span>
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
                            value={challenge.participants?.[0]?.progress || 0}
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
        </section>

        {/* We'll implement completed challenges later */}
      </div>
    </main>
  );
}
