import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { GameStatus, CommunityStats } from "@/types";

export function useCommunityStats(gameId: string) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!gameId) return;

      try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        console.log('Current user:', user?.id); // Debug log

        // First, get ALL stats to check if there are any
        const { data: allStats, error: allStatsError } = await supabase
          .from("user_games")
          .select("user_id, play_time, completion_percentage, achievements_completed, status")
          .eq("game_id", gameId);

        if (allStatsError) throw allStatsError;

        console.log('All stats:', allStats); // Debug log

        if (!allStats || allStats.length === 0) {
          console.log('No stats found for game:', gameId);
          setStats(null);
          return;
        }

        // Filter out current user's stats
        const basicStats = allStats.filter(stat => stat.user_id !== user?.id);
        console.log('Filtered stats (excluding current user):', basicStats); // Debug log

        if (basicStats.length === 0) {
          console.log('No community stats available (only current user stats found)');
          setStats(null);
          return;
        }

        // Calculate averages
        const totalPlayers = basicStats.length;
        const averagePlayTime = basicStats.reduce((acc, curr) => acc + (curr.play_time || 0), 0) / totalPlayers;
        const averageCompletion = basicStats.reduce((acc, curr) => acc + (curr.completion_percentage || 0), 0) / totalPlayers;
        const averageAchievements = basicStats.reduce((acc, curr) => acc + (curr.achievements_completed || 0), 0) / totalPlayers;

        console.log('Calculated averages:', { // Debug log
          totalPlayers,
          averagePlayTime,
          averageCompletion,
          averageAchievements
        });

        // Calculate playtime distribution
        const playTimeRanges = [
          { min: 0, max: 5, label: "0-5h" },
          { min: 5, max: 10, label: "5-10h" },
          { min: 10, max: 20, label: "10-20h" },
          { min: 20, max: 50, label: "20-50h" },
          { min: 50, max: Infinity, label: "50h+" },
        ];

        const playTimeDistribution = playTimeRanges.map(range => ({
          range: range.label,
          count: basicStats.filter(stat => 
            (stat.play_time || 0) >= range.min && 
            (stat.play_time || 0) < range.max
          ).length
        }));

        // Calculate completion distribution
        const completionRanges = [
          { min: 0, max: 20, label: "0-20%" },
          { min: 20, max: 40, label: "20-40%" },
          { min: 40, max: 60, label: "40-60%" },
          { min: 60, max: 80, label: "60-80%" },
          { min: 80, max: 100, label: "80-100%" },
        ];

        const completionDistribution = completionRanges.map(range => ({
          range: range.label,
          count: basicStats.filter(stat => 
            (stat.completion_percentage || 0) >= range.min && 
            (stat.completion_percentage || 0) < range.max
          ).length
        }));

        // Get user statuses distribution
        const userStatuses = Object.entries(
          basicStats.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([status, count]) => ({
          status: status as GameStatus,
          count
        }));

        // Get achievement progress over time (last 30 days)
        const { data: achievementHistory, error: historyError } = await supabase
          .from("game_achievement_history")
          .select("created_at")
          .eq("game_id", gameId)
          .neq("user_id", user?.id)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (historyError) throw historyError;

        const achievementProgress = achievementHistory
          ? Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split("T")[0];
              return {
                date: dateStr,
                count: achievementHistory.filter(
                  h => h.created_at.split("T")[0] === dateStr
                ).length
              };
            }).reverse()
          : [];

        const finalStats = {
          totalPlayers,
          averagePlayTime,
          averageCompletionRate: averageCompletion,
          averageAchievementRate: averageAchievements,
          playTimeDistribution,
          completionDistribution,
          achievementProgress,
          userStatuses,
        };

        console.log('Final stats:', finalStats); // Debug log
        setStats(finalStats);
      } catch (err) {
        console.error("Error fetching community stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch community stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameId]);

  return { stats, loading, error };
} 