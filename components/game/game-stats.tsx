"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useGameProgressStore } from "@/stores/useGameProgressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadingSpinner } from "@/components/loadingSpinner";

interface GameStatsProps {
  gameId: string;
  totalAchievements: number;
}

export function GameStats({ gameId, totalAchievements }: GameStatsProps) {
  const { user } = useAuthStore();
  const {
    isLoading,
    playTime,
    progress,
    achievementsCompleted,
    playTimeHistory,
    achievementHistory,
    fetchGameProgress,
  } = useGameProgressStore();

  React.useEffect(() => {
    if (user && gameId) {
      fetchGameProgress(gameId);
    }
  }, [user, gameId, fetchGameProgress]);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const achievementPercentage =
    totalAchievements > 0
      ? ((achievementsCompleted || 0) / totalAchievements) * 100
      : 0;

  const progressRate =
    progress && playTime && progress > 0
      ? (playTime / progress).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Play Time</p>
              <h3 className="text-2xl font-bold mt-1">{playTime || 0}h</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <Progress value={progress || 0} className="mt-4" variant="blue" />
        </Card>

        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Achievements</p>
              <h3 className="text-2xl font-bold mt-1">
                {achievementsCompleted || 0}/{totalAchievements}
              </h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <Progress
            value={achievementPercentage}
            className="mt-4"
            variant="yellow"
          />
        </Card>

        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Progress Rate</p>
              <h3 className="text-2xl font-bold mt-1">{progressRate}h/%</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BarChart2 className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Hours per completion percentage
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Play Time History */}
        <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Play Time History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playTimeHistory}>
                <defs>
                  <linearGradient
                    id="playTimeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#playTimeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Achievement Progress */}
        <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Achievement Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={achievementHistory}>
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Achievement Stats */}
        <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Achievement Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-medium">
                  {achievementsCompleted || 0}/{totalAchievements}
                </span>
              </div>
              <Progress value={achievementPercentage} variant="yellow" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-xl font-bold mt-1">
                  {achievementPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Remaining</p>
                <p className="text-xl font-bold mt-1">
                  {totalAchievements - (achievementsCompleted || 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
