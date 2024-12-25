"use client";

import { GameStatus } from "@/types/game";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { Trophy, Clock, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailedGameStatsProps {
  playTime: number | null;
  completionPercentage: number | null;
  achievementsCompleted: number;
  totalAchievements: number;
  status: GameStatus;
  lastPlayed?: number;
}

export function DetailedGameStats({
  playTime,
  completionPercentage,
  achievementsCompleted,
  totalAchievements,
  status,
  lastPlayed,
}: DetailedGameStatsProps) {
  const achievementPercentage =
    totalAchievements > 0
      ? (achievementsCompleted / totalAchievements) * 100
      : 0;

  const formatLastPlayed = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Overall Completion */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Overall Completion</span>
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              completionPercentage === 100
                ? "text-green-400"
                : completionPercentage >= 75
                ? "text-blue-400"
                : completionPercentage >= 50
                ? "text-purple-400"
                : completionPercentage >= 25
                ? "text-orange-400"
                : "text-red-400"
            )}
          >
            {completionPercentage || 0}%
          </span>
        </div>
        <ProgressIndicator
          value={completionPercentage || 0}
          variant={completionPercentage === 100 ? "achievement" : "default"}
        />
      </div>

      {/* Play Time */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Play Time</span>
          </div>
          <span className="text-sm text-gray-400">
            {playTime ? `${playTime} hours` : "Not tracked"}
          </span>
        </div>
      </div>

      {/* Achievements */}
      {totalAchievements > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
            <span className="text-sm text-gray-400">
              {achievementsCompleted} / {totalAchievements}
            </span>
          </div>
          <ProgressIndicator
            value={achievementPercentage}
            variant="achievement"
          />
        </div>
      )}

      {/* Last Played */}
      {lastPlayed && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Last Played</span>
            </div>
            <span className="text-sm text-gray-400">
              {formatLastPlayed(lastPlayed)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
