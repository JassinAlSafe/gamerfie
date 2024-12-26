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
    console.log("ChallengesSection - Current state:", {
      totalChallenges: userChallenges.length,
      userChallenges: userChallenges.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        goalType: c.goal_type,
        requirements: c.requirements,
        progress: c.participants?.find((p) => p.user.id === profile?.id)
          ?.progress,
      })),
      gameGenres: game.genres?.map((g) => g.name),
    });

    return userChallenges.filter((challenge) => {
      const participantProgress =
        challenge.participants?.find((p) => p.user.id === profile?.id)
          ?.progress || 0;

      console.log("Checking challenge eligibility:", {
        title: challenge.title,
        status: challenge.status,
        goalType: challenge.goal_type,
        requirements: challenge.requirements,
        participantProgress,
        isCompleted: participantProgress >= 100,
      });

      // Skip completed challenges
      if (participantProgress >= 100) {
        console.log(
          "Challenge filtered out - already completed:",
          challenge.title
        );
        return false;
      }

      if (challenge.status !== "active") {
        console.log("Challenge filtered out - not active:", challenge.title);
        return false;
      }

      if (challenge.goal_type !== "complete_games") {
        console.log(
          "Challenge filtered out - not complete_games:",
          challenge.title
        );
        return false;
      }

      // Check genre requirement
      if (challenge.requirements?.genre) {
        const normalizeGenre = (genre: string) => {
          genre = genre.toLowerCase().trim();
          if (
            genre.includes("role-playing") ||
            genre.includes("rpg") ||
            genre === "role-playing (rpg)"
          ) {
            return "rpg";
          }
          // Remove parentheses and their contents
          genre = genre.replace(/\s*\([^)]*\)/g, "").trim();
          return genre;
        };

        const requiredGenre = normalizeGenre(challenge.requirements.genre);
        const gameGenres =
          game.genres?.map((g) => normalizeGenre(g.name)) || [];
        console.log("Genre check:", {
          challengeTitle: challenge.title,
          requiredGenre,
          gameGenres,
          matches: gameGenres.includes(requiredGenre),
          originalGenres: game.genres?.map((g) => g.name),
        });
        if (!gameGenres.includes(requiredGenre)) return false;
      }

      // Check platform requirement
      if (challenge.requirements?.platform) {
        const normalizePlatform = (platform: string) =>
          platform.toLowerCase().trim();
        const requiredPlatform = normalizePlatform(
          challenge.requirements.platform
        );
        const gamePlatforms =
          game.platforms?.map((p) => normalizePlatform(p.name)) || [];

        console.log("Platform check:", {
          challengeTitle: challenge.title,
          requiredPlatform,
          gamePlatforms,
          matches: gamePlatforms.includes(requiredPlatform),
          originalPlatforms: game.platforms?.map((p) => p.name),
        });

        if (!gamePlatforms.includes(requiredPlatform)) {
          console.log(
            "Challenge filtered out - wrong platform:",
            challenge.title
          );
          return false;
        }
      }

      // Check release year requirement
      if (challenge.requirements?.releaseYear && game.first_release_date) {
        const gameReleaseYear = new Date(
          game.first_release_date * 1000
        ).getFullYear();
        console.log("Release year check:", {
          challengeTitle: challenge.title,
          requiredYear: challenge.requirements.releaseYear,
          gameYear: gameReleaseYear,
          matches: gameReleaseYear === challenge.requirements.releaseYear,
        });
        if (gameReleaseYear !== challenge.requirements.releaseYear) {
          console.log(
            "Challenge filtered out - wrong release year:",
            challenge.title
          );
          return false;
        }
      }

      return true;
    });
  }, [userChallenges, game, profile?.id]);

  console.log("Final eligible challenges:", {
    total: eligibleChallenges.length,
    challenges: eligibleChallenges.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      requirements: c.requirements,
      progress: c.participants?.find((p) => p.user.id === profile?.id)
        ?.progress,
    })),
  });

  const handleContribute = async (challengeId: string) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Eligible Challenges</h3>
        <Trophy className="w-5 h-5 text-yellow-400" />
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
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {challenge.title}
                      </h4>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-400">
                      {challenge.description}
                    </p>
                  </div>

                  {completed ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Trophy className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleContribute(challenge.id);
                      }}
                      className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
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
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400">Goal:</span>
                    <span className="text-white">
                      {challenge.goal_target} games
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
