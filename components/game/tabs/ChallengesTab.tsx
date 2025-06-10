"use client";

import React from "react";
import { Trophy, Clock, Target, Users } from "lucide-react";
import { Game } from "@/types/game";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ChallengesTabProps {
  game: Game;
  profile: Profile | null;
}

export function ChallengesTab({ game, profile }: ChallengesTabProps) {
  // TODO: Fetch challenges from API
  const challenges = [
    {
      id: 1,
      title: "Speed Runner",
      description: "Complete the game in under 10 hours",
      type: "completion",
      goal_type: "playtime",
      goal_value: 600, // minutes
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      participants: 1234,
      progress: profile ? 45 : null,
    },
    {
      id: 2,
      title: "Achievement Hunter",
      description: "Unlock all achievements",
      type: "achievement",
      goal_type: "achievements",
      goal_value: (game as any).achievements?.length || 0,
      start_date: new Date(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      participants: 567,
      progress: profile ? 25 : null,
    },
  ];

  if (!challenges.length) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <p className="text-gray-400 text-center">No challenges available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center text-white">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                {challenge.title}
              </h3>
              <p className="text-gray-400 mt-1">{challenge.description}</p>
            </div>
            {!profile && (
              <Button
                variant="outline"
                className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
              >
                Join Challenge
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">
                {formatTimeRemaining(challenge.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">
                Goal: {formatGoal(challenge.goal_type, challenge.goal_value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">
                {challenge.participants.toLocaleString()} participants
              </span>
            </div>
          </div>

          {profile && challenge.progress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Progress</span>
                <span className="text-white font-medium">
                  {challenge.progress}%
                </span>
              </div>
              <Progress
                value={challenge.progress}
                className="h-2 bg-gray-800"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} days remaining`;
}

function formatGoal(type: string, value: number): string {
  switch (type) {
    case "playtime":
      return `${Math.floor(value / 60)} hours`;
    case "achievements":
      return `${value} achievements`;
    default:
      return value.toString();
  }
}
