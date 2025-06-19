"use client";

import React, { useMemo } from "react";
import {
  BarChart2,
  Calendar,
  Star,
  BookOpen,
  Clock,
  Trophy,
  GamepadIcon,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { JournalEntry } from "@/stores/useJournalStore";

interface JournalGameData {
  id: string;
  name: string;
  cover_url?: string;
}

interface JournalStatsData {
  totalEntries: number;
  typeCount: {
    progress: number;
    review: number;
    daily: number;
    list: number;
  };
  uniqueGamesCount: number;
  avgRating: number;
  mostRecent: JournalEntry | undefined;
  mostTrackedGame: JournalGameData | null;
  maxTrackingCount: number;
  totalHours: number;
}

interface JournalStatsProps {
  entries: JournalEntry[];
}

export const JournalStats = React.memo<JournalStatsProps>(({ entries }) => {
  const stats = useMemo((): JournalStatsData => {
    // Count entries by type
    const typeCount = {
      progress: entries.filter((e) => e.type === "progress").length,
      review: entries.filter((e) => e.type === "review").length,
      daily: entries.filter((e) => e.type === "daily").length,
      list: entries.filter((e) => e.type === "list").length,
    };

    // Get unique games
    const uniqueGames = new Set();
    entries.forEach((entry) => {
      if (entry.game?.id) {
        uniqueGames.add(entry.game.id);
      }
    });

    // Calculate average rating
    const reviews = entries.filter(
      (e) => e.type === "review" && e.rating !== undefined
    );
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
          reviews.length
        : 0;

    // Find most recent entry
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecent = sortedEntries[0];

    // Find most tracked game
    const gameTrackingCount: Record<string, number> = {};
    entries.forEach((entry) => {
      if (entry.game?.id) {
        gameTrackingCount[entry.game.id] =
          (gameTrackingCount[entry.game.id] || 0) + 1;
      }
    });

    let mostTrackedGame: JournalGameData | null = null;
    let maxCount = 0;

    Object.entries(gameTrackingCount).forEach(([gameId, count]) => {
      if (count > maxCount) {
        maxCount = count as number;
        mostTrackedGame = entries.find((e) => e.game?.id === gameId)?.game || null;
      }
    });

    // Total hours played
    const totalHours = entries.reduce(
      (sum, entry) => sum + (entry.hoursPlayed || 0),
      0
    );

    return {
      totalEntries: entries.length,
      typeCount,
      uniqueGamesCount: uniqueGames.size,
      avgRating,
      mostRecent,
      mostTrackedGame,
      maxTrackingCount: maxCount,
      totalHours,
    };
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Journal Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-4">
            {stats.totalEntries} Entries
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Progress</span>
              </div>
              <span className="text-white font-medium">
                {stats.typeCount.progress}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Reviews</span>
              </div>
              <span className="text-white font-medium">
                {stats.typeCount.review}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Daily Logs</span>
              </div>
              <span className="text-white font-medium">
                {stats.typeCount.daily}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300">Lists</span>
              </div>
              <span className="text-white font-medium">
                {stats.typeCount.list}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Gaming Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Unique Games</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {stats.uniqueGamesCount}
                <GamepadIcon className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">
                Total Hours Played
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {stats.totalHours}
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {stats.avgRating > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Average Rating</div>
                <div className="flex items-center gap-1">
                  <div className="text-2xl font-bold text-white">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= Math.round(stats.avgRating / 2)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stats.mostTrackedGame && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Most Tracked Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-800">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">
                  {stats.mostTrackedGame?.name}
                </div>
                <div className="text-sm text-gray-400">
                  {stats.maxTrackingCount} entries
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-400">Entry Breakdown</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Progress Updates</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-900/20 border-blue-800 text-blue-400"
                  >
                    {
                      entries.filter(
                        (e) =>
                          e.type === "progress" &&
                          e.game?.id === stats.mostTrackedGame?.id
                      ).length
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Reviews</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-900/20 border-yellow-800 text-yellow-400"
                  >
                    {
                      entries.filter(
                        (e) =>
                          e.type === "review" &&
                          e.game?.id === stats.mostTrackedGame?.id
                      ).length
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Daily Logs</span>
                  <Badge
                    variant="outline"
                    className="bg-green-900/20 border-green-800 text-green-400"
                  >
                    {
                      entries.filter(
                        (e) =>
                          e.type === "daily" &&
                          e.game?.id === stats.mostTrackedGame?.id
                      ).length
                    }
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.mostRecent && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Latest Entry</div>
                <div className="font-bold text-white">
                  {stats.mostRecent.title ||
                    getEntryTypeLabel(stats.mostRecent.type)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {new Date(stats.mostRecent.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Journal Streak</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-white">
                    {calculateStreak(entries)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span>days</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Review Progress</div>
                <div className="space-y-1">
                  <Progress value={calculateReviewPercentage(entries)} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      {calculateReviewPercentage(entries).toFixed(0)}% of games reviewed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

JournalStats.displayName = 'JournalStats';

function getEntryTypeLabel(type: string) {
  switch (type) {
    case "progress":
      return "Progress Update";
    case "review":
      return "Game Review";
    case "daily":
      return "Daily Log";
    case "list":
      return "Game List";
    default:
      return "Journal Entry";
  }
}

// Calculate streak of consecutive days with journal entries
function calculateStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  
  const sortedDates = [...new Set(entries.map(e => e.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (!sortedDates.length) return 0;
  
  let streak = 1;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if most recent entry is today or yesterday
  const mostRecentDate = new Date(sortedDates[0]);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const mostRecentStr = mostRecentDate.toISOString().split('T')[0];
  
  if (mostRecentStr !== todayStr && mostRecentStr !== yesterdayStr) {
    return 0; // Streak is broken
  }
  
  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const daysDiff = Math.abs(previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Calculate percentage of unique games that have been reviewed
function calculateReviewPercentage(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  
  const uniqueGames = new Set<string>();
  const reviewedGames = new Set<string>();
  
  entries.forEach(entry => {
    if (entry.game?.id) {
      uniqueGames.add(entry.game.id);
      if (entry.type === 'review') {
        reviewedGames.add(entry.game.id);
      }
    }
  });
  
  if (uniqueGames.size === 0) return 0;
  
  return (reviewedGames.size / uniqueGames.size) * 100;
}
