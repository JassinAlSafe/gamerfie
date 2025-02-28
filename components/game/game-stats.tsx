"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Trophy, Clock, Target, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameStatsProps {
  playTime: number;
  completionPercentage: number;
  achievementsCompleted: number;
  totalAchievements: number;
  playTimeHistory: Array<{ date: string; hours: number }>;
  achievementHistory: Array<{ date: string; count: number }>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];

export function GameStats({
  playTime,
  completionPercentage,
  achievementsCompleted,
  totalAchievements,
  playTimeHistory,
  achievementHistory,
}: GameStatsProps) {
  const achievementPercentage = useMemo(
    () => (achievementsCompleted / totalAchievements) * 100,
    [achievementsCompleted, totalAchievements]
  );

  const pieData = useMemo(
    () => [
      { name: "Completed", value: completionPercentage },
      { name: "Remaining", value: 100 - completionPercentage },
    ],
    [completionPercentage]
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Playtime</p>
              <h3 className="text-2xl font-bold mt-1">{playTime}h</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </Card>

        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Completion</p>
              <h3 className="text-2xl font-bold mt-1">
                {completionPercentage}%
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </Card>

        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Achievements</p>
              <h3 className="text-2xl font-bold mt-1">
                {achievementsCompleted}/{totalAchievements}
              </h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <Progress value={achievementPercentage} className="mt-4" />
        </Card>

        <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Progress Rate</p>
              <h3 className="text-2xl font-bold mt-1">
                {(playTime / completionPercentage).toFixed(1)}h/%
              </h3>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playtime Chart */}
        <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Playtime History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={playTimeHistory}>
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
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
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

        {/* Completion Breakdown */}
        <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Completion Breakdown</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-400">
                  {entry.name} ({entry.value}%)
                </span>
              </div>
            ))}
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
                  {achievementsCompleted}/{totalAchievements}
                </span>
              </div>
              <Progress value={achievementPercentage} />
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
                  {totalAchievements - achievementsCompleted}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
