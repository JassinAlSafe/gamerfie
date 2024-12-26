"use client";

import { useMemo } from "react";
import { Game } from "@/types/game";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Clock,
  Star,
  Gamepad2,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChallengesSectionProps {
  game: Game;
}

export function ChallengesSection({ game }: ChallengesSectionProps) {
  const { profile } = useProfile();
  const { userChallenges, updateProgress } = useChallengesStore();

  const eligibleChallenges = useMemo(() => {
    return userChallenges.filter((challenge) => {
      // Only show challenges for this specific game
      if (challenge.game_id !== game.id) {
        return false;
      }

      const participantProgress =
        challenge.participants?.find((p) => p.user.id === profile?.id)
          ?.progress || 0;

      // Skip completed challenges
      if (participantProgress >= 100) {
        return false;
      }

      // Only show active challenges
      if (challenge.status !== "active") {
        return false;
      }

      return true;
    });
  }, [userChallenges, game.id, profile?.id]);

  const handleContribute = async (
    challengeId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!profile) return;

    const challenge = eligibleChallenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const participant = challenge.participants.find(
      (p) => p.user.id === profile.id
    );
    if (!participant) return;

    const currentCompleted = Math.floor(
      (participant.progress / 100) * challenge.goal_target
    );
    const newCompleted = currentCompleted + 1;
    const newProgress = Math.min(
      Math.round((newCompleted / challenge.goal_target) * 100),
      100
    );

    await updateProgress(challengeId, newProgress);
  };

  if (eligibleChallenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" role="region" aria-label="Game Challenges">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Eligible Challenges</h3>
        <Trophy className="w-5 h-5 text-yellow-400" aria-hidden="true" />
      </div>

      <div className="grid gap-4">
        {eligibleChallenges.map((challenge) => {
          const participant = challenge.participants.find(
            (p) => p.user.id === profile?.id
          );

          const progress = participant?.progress || 0;
          const completed = progress >= 100;

          return (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.id}`}
              className={cn(
                "block p-4 rounded-lg border transition-colors cursor-pointer group",
                "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5",
                completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-gray-800/50 border-gray-700/50"
              )}
              role="article"
              aria-labelledby={`challenge-title-${challenge.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        id={`challenge-title-${challenge.id}`}
                        className="font-medium text-white group-hover:text-purple-400 transition-colors"
                      >
                        {challenge.title}
                      </h4>
                      <ChevronRight
                        className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {challenge.description}
                    </p>
                  </div>

                  {completed ? (
                    <div
                      className="flex items-center gap-2 text-green-400"
                      role="status"
                    >
                      <Trophy className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => handleContribute(challenge.id, e)}
                      className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                      aria-label={`Contribute to challenge: ${challenge.title}`}
                    >
                      Contribute
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Challenge progress: ${progress}%`}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target
                      className="w-4 h-4 text-purple-400"
                      aria-hidden="true"
                    />
                    <span className="text-gray-400">Goal:</span>
                    <span className="text-white">
                      {challenge.goal_target}{" "}
                      {challenge.goal_type.replace(/_/g, " ")}
                    </span>
                  </div>

                  {challenge.requirements?.genre && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gamepad2 className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">Genre:</span>
                      <span className="text-white">
                        {challenge.requirements.genre}
                      </span>
                    </div>
                  )}

                  {challenge.requirements?.platform && (
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-white">
                        {challenge.requirements.platform}
                      </span>
                    </div>
                  )}

                  {challenge.requirements?.minRating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Min Rating:</span>
                      <span className="text-white">
                        {challenge.requirements.minRating}
                      </span>
                    </div>
                  )}

                  {challenge.requirements?.releaseYear && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400">Release Year:</span>
                      <span className="text-white">
                        {challenge.requirements.releaseYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
