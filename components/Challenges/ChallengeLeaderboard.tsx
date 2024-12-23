"use client";

import { ChallengeLeaderboard as LeaderboardType } from "@/types/challenge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface ChallengeLeaderboardProps {
  leaderboard: LeaderboardType;
}

export function ChallengeLeaderboard({
  leaderboard,
}: ChallengeLeaderboardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold">Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {leaderboard.rankings.map((entry) => (
          <div
            key={entry.user_id}
            className="flex items-center justify-between p-4 bg-card rounded-lg border"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-muted-foreground min-w-[2rem]">
                #{entry.rank}
              </span>
              <Avatar>
                <AvatarImage src={entry.avatar_url} alt={entry.username} />
                <AvatarFallback>
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {entry.progress}%
              </span>
              {entry.completed && (
                <Trophy className="w-4 h-4 text-yellow-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
