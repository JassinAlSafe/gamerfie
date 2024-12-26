"use client";

import React from "react";
import { Users, Activity, Trophy, Clock } from "lucide-react";
import { Game } from "@/types/game";
import { Profile } from "@/types/profile";
import { GameStats } from "@/components/game/game-stats";
import { CommunityStats } from "@/components/game/community-stats";

interface StatsTabProps {
  game: Game;
  profile: Profile | null;
  progress: {
    playTime: number | null;
    completionPercentage: number | null;
    achievementsCompleted: number | null;
    loading: boolean;
    playTimeHistory: Array<{ date: string; hours: number }>;
    achievementHistory: Array<{ date: string; count: number }>;
  };
}

export function StatsTab({ game, profile, progress }: StatsTabProps) {
  return (
    <div className="space-y-8">
      {/* Personal Stats */}
      {profile && (
        <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Your Stats
          </h3>
          <GameStats
            playTime={progress.playTime || 0}
            completionPercentage={progress.completionPercentage || 0}
            achievementsCompleted={progress.achievementsCompleted || 0}
            totalAchievements={game.achievements?.length || 0}
            playTimeHistory={progress.playTimeHistory || []}
            achievementHistory={progress.achievementHistory || []}
          />
        </div>
      )}

      {/* Community Stats */}
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
          <Users className="w-5 h-5 mr-2 text-green-400" />
          Community Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            label="Total Players"
            value={formatNumber(game.total_players || 0)}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-green-400" />}
            label="Active Players"
            value={formatNumber(game.active_players || 0)}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            label="Avg. Completion"
            value={`${Math.round(game.completion_rate || 0)}%`}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-purple-400" />}
            label="Avg. Playtime"
            value={formatPlaytime(game.average_playtime || 0)}
          />
        </div>
        <div className="mt-8">
          <CommunityStats gameId={game.id.toString()} />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm border border-white/5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}K hrs`;
  }
  return `${hours} hrs`;
}
