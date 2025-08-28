"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Lock } from "lucide-react";
import { Game } from "@/types";
import { Profile } from "@/types/profile";
import { Progress } from "@/components/ui/progress";

interface AchievementsTabProps {
  game: Game;
  profile: Profile | null;
}

export function AchievementsTab({ game, profile }: AchievementsTabProps) {
  // Check if achievements exist in the game data
  const hasAchievements = (game as any).achievements?.length > 0;
  
  if (!hasAchievements) {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Achievements Available</h3>
          <p className="text-gray-400 text-center max-w-md mb-4">
            This game doesn't have achievement data available in our database yet. 
            Achievement tracking may be added in future updates.
          </p>
          <a
            href="/achievements"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trophy className="w-4 h-4" />
            View Your Achievements
          </a>
        </div>
      </div>
    );
  }

  const totalAchievements = (game as any).achievements.length;
  const unlockedAchievements = profile ? 0 : null; // TODO: Get from user progress

  return (
    <div className="space-y-8">
      {/* Achievement Progress */}
      {profile && (
        <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center text-white">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Your Progress
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-400">Achievements Unlocked</p>
              <p className="text-2xl font-bold text-white">
                {unlockedAchievements || 0}/{totalAchievements}
              </p>
            </div>
          </div>
          <Progress
            value={((unlockedAchievements || 0) / totalAchievements) * 100}
            className="h-2 bg-gray-800"
          />
        </div>
      )}

      {/* Achievements List */}
      <div className="bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/40">
        <div className="space-y-4">
          {(game as any).achievements.map((achievement: any) => (
            <div
              key={achievement.id}
              className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-white/5 transition-all duration-200 hover:bg-gray-900/70"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                {achievement.icon_url ? (
                  <Image
                    src={achievement.icon_url}
                    alt={achievement.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                {achievement.is_hidden && !profile && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-white">
                  {achievement.is_hidden && !profile
                    ? "Hidden Achievement"
                    : achievement.name}
                </h4>
                <p className="text-sm text-gray-400">
                  {achievement.is_hidden && !profile
                    ? "Keep playing to unlock this achievement"
                    : achievement.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm text-gray-400">Rarity</div>
                <div className="font-semibold text-yellow-400">
                  {achievement.rarity.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
