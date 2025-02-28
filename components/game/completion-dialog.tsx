"use client";

import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { useProgressStore } from "@/stores/useProgressStore";
// PAUSED: import { useChallengesStore } from "@/stores/useChallengesStore";
import { useProfile } from "@/hooks/Profile/use-profile";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@/components/loadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { Clock, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Define interface for the challenges store
// interface ChallengesStore {
  userChallenges: any[];
  updateProgress: (challengeId: string, progress: number) => Promise<void>;
  fetchUserChallenges: () => Promise<void>;
// }

interface CompletionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
}

export function CompletionDialog({
  isOpen,
  setIsOpen,
  game,
}: CompletionDialogProps) {
  const { profile } = useProfile();
  const {
    updateProgress,
    fetchProgress,
    play_time,
    completion_percentage,
    achievements_completed,
  } = useProgressStore();

  // CHALLENGES FEATURE PAUSED
  // Uncomment the following code when challenges feature is ready
  /*
  const {
    userChallenges,
    updateProgress: updateChallengeProgress,
    fetchUserChallenges,
  } = useChallengesStore() as unknown as ChallengesStore;
  */

  // Stub for paused challenges feature
  const userChallenges: any[] = [];
  const updateChallengeProgress = async () => {};
  const fetchUserChallenges = async () => {};

  // Always use completion step when challenges are paused
  const [step, setStep] = useState<"completion">("completion");
  const [localPlayTime, setLocalPlayTime] = useState(0);
  const [localCompletion, setLocalCompletion] = useState(0);
  const [localAchievementsCompleted, setLocalAchievementsCompleted] =
    useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChallenges([]);
      // Challenges feature paused
      // fetchUserChallenges();
    }
  }, [isOpen]);

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  useEffect(() => {
    setLocalPlayTime(play_time || 0);
    setLocalCompletion(completion_percentage || 0);
    setLocalAchievementsCompleted(achievements_completed || 0);
  }, [play_time, completion_percentage, achievements_completed]);

  // Add debug logging for userChallenges
  useEffect(() => {
    console.log("CompletionDialog - Current userChallenges:", {
      total: userChallenges.length,
      challenges: userChallenges.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        goalType: c.goal_type,
        requirements: c.requirements,
        progress: c.participants?.find((p: any) => p.user.id === profile?.id)
          ?.progress,
      })),
    });
  }, [userChallenges, profile?.id]);

  if (!game) {
    return null;
  }

  // Add a type guard and proper typing for the achievements property
  interface GameAchievements {
    total: number;
  }

  const gameAchievements =
    "achievements" in game ? (game.achievements as GameAchievements) : null;
  const totalAchievements = gameAchievements?.total ?? 0;
  const achievementPercentage =
    totalAchievements > 0
      ? (localAchievementsCompleted / totalAchievements) * 100
      : 0;

  // Filter eligible challenges
  console.log("Starting challenge filtering with:", {
    totalChallenges: userChallenges.length,
    allChallenges: userChallenges.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      requirements: c.requirements,
      goalType: c.goal_type,
    })),
  });

  const eligibleChallenges = userChallenges.filter((challenge: any) => {
    console.log("Checking challenge:", {
      title: challenge.title,
      status: challenge.status,
      goalType: challenge.goal_type,
      requirements: challenge.requirements,
      gameDetails: {
        name: game.name,
        releaseDate: game.first_release_date,
        releaseYear: game.first_release_date
          ? new Date(game.first_release_date * 1000).getFullYear()
          : null,
        platforms: game.platforms?.map((p) => p.name),
        genres: game.genres?.map((g) => g.name),
      },
    });

    const participantProgress =
      challenge.participants?.find((p: any) => p.user.id === profile?.id)
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
      const gameGenres = game.genres?.map((g) => normalizeGenre(g.name)) || [];
      console.log("Genre check in dialog:", {
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

      console.log("Platform check in dialog:", {
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

  console.log("Final eligible challenges:", {
    total: eligibleChallenges.length,
    challenges: eligibleChallenges.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      requirements: c.requirements,
      progress: c.participants?.find((p: any) => p.user.id === profile?.id)
        ?.progress,
    })),
  });

  const handleSubmit = async () => {
    if (!profile?.id) return;
    setIsSubmitting(true);

    try {
      // First update game progress
      await updateProgress(profile.id.toString(), game.id.toString(), {
        play_time: localPlayTime,
        completion_percentage: localCompletion,
        achievements_completed: localAchievementsCompleted,
      });

      // CHALLENGES FEATURE PAUSED
      // The following code is disabled until challenges feature is ready
      /*
      if (step === "completion") {
        // If there are eligible challenges, move to challenges step
        if (eligibleChallenges.length > 0) {
          setStep("challenges");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Update selected challenges
        for (const challengeId of selectedChallenges) {
          const challenge = eligibleChallenges.find(
            (c: any) => c.id === challengeId
          );
          if (!challenge) continue;

          const participant = challenge.participants.find(
            (p: any) => p.user.id === profile.id
          );
          if (!participant) continue;

          const currentCompleted = Math.floor(
            (participant.progress / 100) * challenge.goal_target
          );
          const newCompleted = currentCompleted + 1;
          const newProgress = Math.min(
            Math.round((newCompleted / challenge.goal_target) * 100),
            100
          );

          await updateChallengeProgress(challengeId, newProgress);
        }
      }
      */

      setIsOpen(false);
      toast.success("Progress updated successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to update progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const toggleChallenge = (challengeId: string) => {
  //   setSelectedChallenges((prev) =>
  //     prev.includes(challengeId)
  //       ? prev.filter((id) => id !== challengeId)
  //       : [...prev, challengeId]
  //   );
  // };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Track your progress for {game.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Existing completion form fields */}
          <div className="space-y-4">
            <Label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Overall Completion
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  localCompletion === 100
                    ? "text-green-400"
                    : localCompletion >= 75
                    ? "text-blue-400"
                    : localCompletion >= 50
                    ? "text-purple-400"
                    : localCompletion >= 25
                    ? "text-orange-400"
                    : "text-red-400"
                )}
              >
                {localCompletion}%
              </span>
            </Label>
            <Slider
              value={[localCompletion]}
              onValueChange={([value]) => setLocalCompletion(value)}
              max={100}
              step={1}
              className={cn(
                "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4",
                "[&_[role=slider]]:transition-colors",
                localCompletion === 100
                  ? "[&_[role=slider]]:bg-green-500"
                  : localCompletion >= 75
                  ? "[&_[role=slider]]:bg-blue-500"
                  : localCompletion >= 50
                  ? "[&_[role=slider]]:bg-purple-500"
                  : localCompletion >= 25
                  ? "[&_[role=slider]]:bg-orange-500"
                  : "[&_[role=slider]]:bg-red-500"
              )}
            />
            <ProgressIndicator
              value={localCompletion}
              className="transition-all duration-300"
            />
          </div>

          {/* Play Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Play Time (hours)
            </Label>
            <Input
              type="number"
              value={localPlayTime}
              onChange={(e) => setLocalPlayTime(Number(e.target.value))}
              min={0}
              step={0.5}
            />
          </div>

          {/* Achievements */}
          {totalAchievements > 0 && (
            <div className="space-y-4">
              <Label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Achievements
                </div>
                <span className="text-sm text-gray-400">
                  {localAchievementsCompleted} / {totalAchievements}
                </span>
              </Label>
              <Input
                type="number"
                value={localAchievementsCompleted}
                onChange={(e) =>
                  setLocalAchievementsCompleted(Number(e.target.value))
                }
                min={0}
                max={totalAchievements}
              />
              <ProgressIndicator
                value={achievementPercentage}
                variant="achievement"
                className="transition-all duration-300"
              />
            </div>
          )}

          {/* Status Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-300">
              Status Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Overall Progress</p>
                <p
                  className={cn(
                    "font-medium",
                    localCompletion === 100
                      ? "text-green-400"
                      : localCompletion >= 75
                      ? "text-blue-400"
                      : localCompletion >= 50
                      ? "text-purple-400"
                      : localCompletion >= 25
                      ? "text-orange-400"
                      : "text-red-400"
                  )}
                >
                  {localCompletion}%
                </p>
              </div>
              <div>
                <p className="text-gray-400">Play Time</p>
                <p className="font-medium text-white">{localPlayTime}h</p>
              </div>
              {totalAchievements > 0 && (
                <div>
                  <p className="text-gray-400">Achievements</p>
                  <p className="font-medium text-yellow-400">
                    {achievementPercentage.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Progress"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
