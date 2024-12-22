"use client";

import { useEffect } from "react";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Trophy,
  Target,
  Calendar,
  Users,
  Gamepad2,
  Plus,
  Loader2,
} from "lucide-react";

export default function ProfileChallengesPage() {
  const { challenges, isLoading, error, fetchChallenges } =
    useChallengesStore();

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "active"
  );
  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === "completed"
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading challenges: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">My Challenges</h1>
          <p className="text-gray-400">
            Track your progress in active challenges and view completed ones
          </p>
        </div>
        <Link href="/challenges/create">
          <Button className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </Link>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Active Challenges</h2>
        </div>

        {activeChallenges.length === 0 ? (
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <div className="text-center text-gray-400">
              <p>You haven't joined any active challenges yet.</p>
              <Link
                href="/challenges"
                className="text-purple-400 hover:underline"
              >
                Browse available challenges
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                <Card className="p-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-purple-500/50 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">
                          {challenge.title}
                        </h3>
                        <Badge
                          variant={
                            challenge.type === "competitive"
                              ? "default"
                              : "secondary"
                          }
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        >
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>
                          {challenge.goal?.target || 0}{" "}
                          {challenge.goal?.type || "complete_games"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>
                          Ends{" "}
                          {formatDistanceToNow(new Date(challenge.end_date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-purple-400">
                          {challenge.progress || 0}%
                        </span>
                      </div>
                      <Progress
                        value={challenge.progress || 0}
                        className="h-2"
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold">Completed Challenges</h2>
        </div>

        {completedChallenges.length === 0 ? (
          <Card className="p-6 bg-gray-800/50 border-gray-700/50">
            <div className="text-center text-gray-400">
              <p>You haven't completed any challenges yet.</p>
              <p>Join a challenge and start making progress!</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                <Card className="p-4 bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80 hover:border-purple-500/50 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">
                          {challenge.title}
                        </h3>
                        <Badge
                          variant={
                            challenge.type === "competitive"
                              ? "default"
                              : "secondary"
                          }
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        >
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>
                          {challenge.goal?.target || 0}{" "}
                          {challenge.goal?.type || "complete_games"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>
                          {challenge.participants?.length || 0} participants
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={challenge.creator_avatar} />
                          <AvatarFallback>
                            {challenge.creator_username
                              ?.slice(0, 2)
                              .toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">
                          Created by {challenge.creator_username}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-green-400">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
