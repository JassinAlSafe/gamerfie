import React, { useEffect, useState } from "react";
import { Trophy, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Achievement } from "@/types/game";
import { LoadingSpinner } from "@/components/loadingSpinner";

interface AchievementsSectionProps {
  gameId: string;
}

export function AchievementsSection({ gameId }: AchievementsSectionProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/games/${gameId}/achievements`);
        if (!response.ok) throw new Error("Failed to fetch achievements");
        const data = await response.json();
        setAchievements(data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch achievements"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Error loading achievements</p>
        <p className="text-sm mt-2 text-gray-500">{error}</p>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No achievements available for this game.</p>
        <p className="text-sm mt-2 text-gray-500">
          This game might not have achievements or they haven't been added to
          the database yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-gray-900/50 rounded-lg p-4 border border-white/10 flex items-center gap-4 group hover:bg-gray-900/70 transition-colors"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-grow">
            <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
              {achievement.name || "Unnamed Achievement"}
            </h4>
            <p className="text-sm text-gray-400 line-clamp-2">
              {achievement.description || "No description available"}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-400"
            >
              {achievement.points || 0}G
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
