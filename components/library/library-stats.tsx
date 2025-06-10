"use client";

import { useLibraryStore } from '@/stores/useLibraryStore';
import { Trophy, Clock, Star, Gamepad2 } from 'lucide-react';

export function LibraryStats() {
  const { games } = useLibraryStore();

  const stats = {
    totalGames: games.length,
    completedGames: games.filter(game => (game as any).completed).length,
    totalPlayTime: games.reduce((total, game) => total + ((game as any).playTime || 0), 0),
    averageRating: games.reduce((total, game) => total + (game.rating || 0), 0) / games.length || 0,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={Gamepad2}
        label="Total Games"
        value={stats.totalGames.toString()}
      />
      <StatCard
        icon={Trophy}
        label="Completed"
        value={`${stats.completedGames}/${stats.totalGames}`}
      />
      <StatCard
        icon={Clock}
        label="Play Time"
        value={`${Math.round(stats.totalPlayTime)}h`}
      />
      <StatCard
        icon={Star}
        label="Avg Rating"
        value={stats.averageRating.toFixed(1)}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 flex flex-col items-center">
      <Icon className="w-5 h-5 text-purple-400 mb-2" />
      <span className="text-sm text-gray-400 mb-1">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
} 