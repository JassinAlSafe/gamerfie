"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Crown,
  Search,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  progress: number;
  rank: number;
}

interface ChallengeLeaderboardProps {
  challengeId: string;
  isLoading: boolean;
  error: string | null;
  rankings: LeaderboardEntry[];
}

export function ChallengeLeaderboard({
  challengeId,
  isLoading,
  error,
  rankings = [],
}: ChallengeLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredRankings = rankings.filter((entry) =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedRankings = showAll
    ? filteredRankings
    : filteredRankings.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-purple-400" />;
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading leaderboard: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/challenges/${challengeId}`}
          className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Challenge</span>
        </Link>
      </div>

      <Card className="p-6 bg-gray-800/50 border-gray-700/50">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-gray-400">
              Track your progress and compete with other participants
            </p>
          </div>

          {rankings.length > 0 && (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4">
                {/* Second Place */}
                {rankings[1] && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-gray-400">
                        <AvatarImage src={rankings[1].avatar_url} />
                        <AvatarFallback>
                          {rankings[1].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <Medal className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-semibold truncate max-w-[120px]">
                        {rankings[1].username}
                      </p>
                      <p className="text-sm text-gray-400">
                        {rankings[1].progress}%
                      </p>
                    </div>
                  </div>
                )}

                {/* First Place */}
                {rankings[0] && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-yellow-400">
                        <AvatarImage src={rankings[0].avatar_url} />
                        <AvatarFallback>
                          {rankings[0].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <Crown className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-semibold truncate max-w-[120px]">
                        {rankings[0].username}
                      </p>
                      <p className="text-sm text-gray-400">
                        {rankings[0].progress}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Third Place */}
                {rankings[2] && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-4 border-amber-600">
                        <AvatarImage src={rankings[2].avatar_url} />
                        <AvatarFallback>
                          {rankings[2].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <Medal className="w-8 h-8 text-amber-600" />
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-semibold truncate max-w-[120px]">
                        {rankings[2].username}
                      </p>
                      <p className="text-sm text-gray-400">
                        {rankings[2].progress}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Search and Rankings List */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-gray-800/30 border-gray-700/30"
                  />
                </div>

                <div className="space-y-2">
                  {displayedRankings.map((entry) => (
                    <Card
                      key={entry.user_id}
                      className="p-4 bg-gray-800/30 border-gray-700/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <span className="text-lg font-semibold">
                            #{entry.rank}
                          </span>
                        </div>
                        <Avatar>
                          <AvatarImage src={entry.avatar_url} />
                          <AvatarFallback>
                            {entry.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {entry.username}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={entry.progress} className="h-2" />
                            <span className="text-sm text-gray-400">
                              {entry.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredRankings.length > 10 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                  >
                    {showAll
                      ? "Show Less"
                      : `Show All (${filteredRankings.length})`}
                  </Button>
                )}
              </div>
            </>
          )}

          {rankings.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No participants yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
