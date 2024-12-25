"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Card } from "@/components/ui/card";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Users,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { Challenge, ChallengeStatus, ChallengeType } from "@/types/challenge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type SortOption = "end_date" | "progress" | "participants";

export default function ProfileChallengesPage() {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();

  const {
    userChallenges,
    isLoading: challengesLoading,
    error: challengesError,
    fetchUserChallenges,
    updateProgress,
  } = useChallengesStore();

  const router = useRouter();
  const supabase = createClientComponentClient();

  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<ChallengeType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("end_date");

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

        fetchUserChallenges();
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router, fetchUserChallenges]);

  // Separate active and completed challenges
  const activeChallenges = userChallenges.filter((challenge) => {
    const userProgress =
      challenge.participants.find((p) => p.user.id === profile?.id)?.progress ||
      0;
    return challenge.status !== "completed" && userProgress < 100;
  });

  const completedChallenges = userChallenges.filter((challenge) => {
    const userProgress =
      challenge.participants.find((p) => p.user.id === profile?.id)?.progress ||
      0;
    return challenge.status === "completed" || userProgress === 100;
  });

  // Filter and sort function for both sections
  const filterAndSortChallenges = (challenges: Challenge[]) => {
    return challenges
      .filter((challenge) => {
        if (statusFilter !== "all" && challenge.status !== statusFilter)
          return false;
        if (typeFilter !== "all" && challenge.type !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "end_date":
            return (
              new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
            );
          case "progress":
            const aProgress =
              a.participants.find((p) => p.user.id === profile?.id)?.progress ||
              0;
            const bProgress =
              b.participants.find((p) => p.user.id === profile?.id)?.progress ||
              0;
            return bProgress - aProgress;
          case "participants":
            return b.participants.length - a.participants.length;
          default:
            return 0;
        }
      });
  };

  const filteredActiveChallenges = filterAndSortChallenges(activeChallenges);
  const filteredCompletedChallenges =
    filterAndSortChallenges(completedChallenges);

  if (profileLoading || challengesLoading) {
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

  if (challengesError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-semibold">
          Error loading challenges: {challengesError}
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
              stats={
                gameStats ?? {
                  total_played: 0,
                  played_this_year: 0,
                  backlog: 0,
                }
              }
              onProfileUpdate={() => {}}
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
            <div className="space-y-12">
              {/* Active Challenges Section */}
              <div className="space-y-8">
                {/* Header Section with Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">
                      My Challenges ({filteredActiveChallenges.length})
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/challenges">
                      <Button
                        variant="outline"
                        className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                      >
                        Browse Challenges
                      </Button>
                    </Link>
                    {/* Status Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Status
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("all")}
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("active")}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("upcoming")}
                        >
                          Upcoming
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("completed")}
                        >
                          Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Type Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Type
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTypeFilter("competitive")}
                        >
                          Competitive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTypeFilter("collaborative")}
                        >
                          Collaborative
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                        >
                          Sort by
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem onClick={() => setSortBy("end_date")}>
                          End Date
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("progress")}>
                          Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSortBy("participants")}
                        >
                          Participants
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Active Challenges Grid */}
                {filteredActiveChallenges.length === 0 ? (
                  <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <div className="text-center space-y-2">
                      <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
                      <p className="text-gray-400">
                        No active challenges found
                      </p>
                      <p className="text-sm text-gray-500">
                        {activeChallenges.length === 0 ? (
                          <>
                            You haven't joined any challenges yet.{" "}
                            <Link
                              href="/challenges"
                              className="text-purple-400 hover:text-purple-300"
                            >
                              Browse available challenges
                            </Link>
                          </>
                        ) : (
                          "Try adjusting your filters"
                        )}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredActiveChallenges.map((challenge) => (
                      <Link
                        key={challenge.id}
                        href={`/challenges/${challenge.id}`}
                      >
                        <Card className="p-4 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer group">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
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
                                    {challenge.participants.length} joined
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">
                                    Progress
                                  </span>
                                  <span className="text-purple-400">
                                    {challenge.participants.find(
                                      (p) => p.user.id === profile.id
                                    )?.progress || 0}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    challenge.participants.find(
                                      (p) => p.user.id === profile.id
                                    )?.progress || 0
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

              {/* Completed Challenges Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Completed Challenges ({filteredCompletedChallenges.length})
                  </h2>
                </div>

                {filteredCompletedChallenges.length === 0 ? (
                  <Card className="p-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <div className="text-center space-y-2">
                      <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
                      <p className="text-gray-400">
                        No completed challenges yet
                      </p>
                      <p className="text-sm text-gray-500">
                        Complete your active challenges to see them here
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCompletedChallenges.map((challenge) => (
                      <Link
                        key={challenge.id}
                        href={`/challenges/${challenge.id}`}
                      >
                        <Card className="p-4 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer group">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
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
                                    {challenge.participants.length} joined
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">
                                    Progress
                                  </span>
                                  <span className="text-purple-400">
                                    {challenge.participants.find(
                                      (p) => p.user.id === profile.id
                                    )?.progress || 0}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    challenge.participants.find(
                                      (p) => p.user.id === profile.id
                                    )?.progress || 0
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
    </div>
  );
}
