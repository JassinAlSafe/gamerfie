import React from "react";
import { Users, Clock, Trophy, Target, BarChart2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useCommunityStats } from "@/hooks/use-community-stats";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CommunityStatsProps {
  gameId: string;
}

export function CommunityStats({ gameId }: CommunityStatsProps) {
  const { stats, loading, error } = useCommunityStats(gameId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load community stats: {error}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-gray-400">No community stats available</div>;
  }

  // Calculate hours per completion percentage
  const hoursPerPercentage =
    stats.averagePlayTime > 0 && stats.averageCompletionRate > 0
      ? (stats.averagePlayTime / stats.averageCompletionRate).toFixed(1)
      : "N/A";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4 text-blue-400" />
            Total Playtime
          </div>
          <div className="mt-1 text-xl font-semibold">
            {stats.averagePlayTime.toFixed(1)}h
          </div>
          <Progress value={stats.averagePlayTime} className="mt-2" />
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Target className="w-4 h-4 text-purple-400" />
            Completion
          </div>
          <div className="mt-1 text-xl font-semibold">
            {stats.averageCompletionRate.toFixed(1)}%
          </div>
          <Progress value={stats.averageCompletionRate} className="mt-2" />
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Achievements
          </div>
          <div className="mt-1 text-xl font-semibold">
            {stats.averageAchievementRate.toFixed(1)}%
          </div>
          <Progress value={stats.averageAchievementRate} className="mt-2" />
        </Card>

        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <BarChart2 className="w-4 h-4 text-green-400" />
            Hours/Completion %
          </div>
          <div className="mt-1 text-xl font-semibold">
            {hoursPerPercentage}h
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Hours per completion percentage
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playtime History */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-4">
            Playtime History
          </h4>
          <div className="h-[200px] bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </Card>

        {/* Achievement Progress */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-4">
            Achievement Progress
          </h4>
          <div className="h-[200px] bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </Card>

        {/* Completion Breakdown */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-4">
            Completion Breakdown
          </h4>
          <div className="h-[200px] bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </Card>

        {/* Achievement Stats */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-4">
            Achievement Stats
          </h4>
          <div className="h-[200px] bg-gray-900/50 rounded-lg flex items-center justify-center">
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
