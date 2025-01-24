"use client";

import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { useGameProgressStore } from "@/stores/useGameProgressStore";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { useProfile } from "@/hooks/use-profile";
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
import { Clock, Trophy, Target, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
    fetchGameProgress,
    playTime,
    progress: completionPercentage,
    achievementsCompleted,
  } = useGameProgressStore();

  const { challenges, fetchChallenges } = useChallengesStore();

  const [step, setStep] = useState<"completion" | "challenges">("completion");
  const [localPlayTime, setLocalPlayTime] = useState(0);
  const [localCompletion, setLocalCompletion] = useState(0);
  const [localAchievementsCompleted, setLocalAchievementsCompleted] =
    useState(0);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      const supabase = createClientComponentClient();
      setStep("completion");
      setSelectedChallenges([]);
      fetchChallenges(supabase);
    }
  }, [isOpen, fetchChallenges]);

  useEffect(() => {
    if (game?.id) {
      fetchGameProgress(game.id.toString());
    }
  }, [game?.id, fetchGameProgress]);

  useEffect(() => {
    setLocalPlayTime(playTime || 0);
    setLocalCompletion(completionPercentage || 0);
    setLocalAchievementsCompleted(achievementsCompleted || 0);
  }, [playTime, completionPercentage, achievementsCompleted]);

  // Add debug logging for challenges
  useEffect(() => {
    console.log("CompletionDialog - Current challenges:", {
      total: challenges.length,
      challenges: challenges.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        goal: c.goal,
        rules: c.rules,
        participants: c.participants?.map((p) => ({
          userId: p.user_id,
          username: p.username,
        })),
      })),
    });
  }, [challenges, profile?.id]);

  if (!game) {
    return null;
  }

  const totalAchievements = 100; // Using a fixed value since achievements are tracked in the progress store
  const achievementPercentage =
    totalAchievements > 0
      ? (localAchievementsCompleted / totalAchievements) * 100
      : 0;

  // Filter eligible challenges
  console.log("Starting challenge filtering with:", {
    totalChallenges: challenges.length,
    allChallenges: challenges.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      goal: c.goal,
      rules: c.rules,
    })),
  });

  const eligibleChallenges = challenges.filter((challenge) => {
    console.log("Checking challenge:", {
      title: challenge.title,
      status: challenge.status,
      goal: challenge.goal,
      rules: challenge.rules,
      participants: challenge.participants?.map((p) => ({
        userId: p.user_id,
        username: p.username,
      })),
    });

    const participant = challenge.participants?.find(
      (p) => p.user_id === profile?.id
    );

    // Skip completed challenges
    const participantProgress = participant?.completion_percentage ?? 0;
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

    if (challenge.goal?.type !== "complete_games") {
      console.log(
        "Challenge filtered out - not complete_games:",
        challenge.title
      );
      return false;
    }

    // Check genre requirement
    const genreRule = challenge.rules?.find((r) => r.rule.startsWith("genre:"));
    if (genreRule) {
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

      const requiredGenre = normalizeGenre(genreRule.rule.split(":")[1]);
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
    const platformRule = challenge.rules?.find((r) =>
      r.rule.startsWith("platform:")
    );
    if (platformRule) {
      const normalizePlatform = (platform: string) =>
        platform.toLowerCase().trim();
      const requiredPlatform = normalizePlatform(
        platformRule.rule.split(":")[1]
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
    const yearRule = challenge.rules?.find((r) => r.rule.startsWith("year:"));
    if (yearRule && game.first_release_date) {
      const gameReleaseYear = new Date(
        game.first_release_date * 1000
      ).getFullYear();
      const requiredYear = parseInt(yearRule.rule.split(":")[1], 10);
      console.log("Release year check:", {
        challengeTitle: challenge.title,
        requiredYear,
        gameYear: gameReleaseYear,
        matches: gameReleaseYear === requiredYear,
      });
      if (gameReleaseYear !== requiredYear) {
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
    challenges: eligibleChallenges.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      goal: c.goal,
      rules: c.rules,
    })),
  });

  const handleSubmit = async () => {
    if (!profile?.id) return;
    setIsSubmitting(true);

    try {
      console.log("Starting submission with:", {
        step,
        completionPercentage: localCompletion,
        eligibleChallengesCount: eligibleChallenges.length,
        selectedChallenges,
      });

      // First update game progress
      await updateProgress(game.id.toString(), {
        play_time: localPlayTime,
        completion_percentage: localCompletion,
        achievements_completed: localAchievementsCompleted,
      });

      if (step === "completion") {
        // If there are eligible challenges, move to challenges step
        console.log("After progress update:", {
          step,
          eligibleChallenges: eligibleChallenges.map((c) => ({
            title: c.title,
            goal: c.goal,
            rules: c.rules,
          })),
        });

        if (eligibleChallenges.length > 0) {
          console.log("Moving to challenges step");
          setStep("challenges");
          setIsSubmitting(false);
          return;
        } else {
          console.log("No eligible challenges found, closing dialog");
        }
      } else {
        console.log("Processing selected challenges:", selectedChallenges);
        // Update selected challenges
        for (const challengeId of selectedChallenges) {
          const challenge = eligibleChallenges.find(
            (c) => c.id === challengeId
          );
          if (!challenge) {
            console.log("Challenge not found:", challengeId);
            continue;
          }

          const participant = challenge.participants?.find(
            (p) => p.user_id === profile.id
          );
          if (!participant) {
            console.log(
              "Participant not found for challenge:",
              challenge.title
            );
            continue;
          }

          const target = challenge.goal?.target ?? 1;
          const currentProgress = participant.completion_percentage ?? 0;
          const currentCompleted = Math.floor((currentProgress / 100) * target);
          const newCompleted = currentCompleted + 1;
          const newProgress = Math.min(
            Math.round((newCompleted / target) * 100),
            100
          );

          console.log("Updating challenge progress:", {
            challengeTitle: challenge.title,
            currentProgress,
            newProgress,
          });

          if (!challenge || !challenge.goals?.length) {
            console.log("Challenge has no goals:", challenge?.title);
            continue;
          }

          await fetch(
            `/api/challenges/${challengeId}/goals/${challenge.goals[0].id}/progress`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ progress: newProgress }),
            }
          );
        }
      }

      setIsOpen(false);
      toast.success(
        step === "completion"
          ? "Progress updated successfully"
          : "Progress and challenges updated successfully"
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to update progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {(() => {
        console.log("Rendering dialog with:", {
          step,
          isOpen,
          eligibleChallengesCount: eligibleChallenges.length,
          selectedChallenges,
        });
        return (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {step === "completion"
                  ? "Update Progress"
                  : "Add to Challenges"}
              </DialogTitle>
              <DialogDescription>
                {step === "completion"
                  ? `Track your progress for ${game.name}`
                  : "Select challenges to contribute this game to"}
              </DialogDescription>
            </DialogHeader>

            {step === "completion" ? (
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
            ) : (
              (() => {
                console.log("Rendering challenges step with:", {
                  eligibleChallenges: eligibleChallenges.map((c) => ({
                    title: c.title,
                    goal: c.goal,
                  })),
                });
                return (
                  <div className="py-4 space-y-4">
                    {eligibleChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className={cn(
                          "p-4 rounded-lg border transition-colors cursor-pointer",
                          selectedChallenges.includes(challenge.id)
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                        )}
                        onClick={() => toggleChallenge(challenge.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow space-y-1">
                            <h4 className="font-medium text-white">
                              {challenge.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Progress:{" "}
                              {challenge.participants?.find(
                                (p) => p.user_id === profile?.id
                              )?.completion_percentage ?? 0}
                              %
                            </p>
                            {challenge.rules
                              ?.find((r) => r.rule.startsWith("genre:"))
                              ?.rule.split(":")[1] && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  Required Genre:
                                </span>
                                <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded">
                                  {
                                    challenge.rules
                                      .find((r) => r.rule.startsWith("genre:"))!
                                      .rule.split(":")[1]
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          {selectedChallenges.includes(challenge.id) && (
                            <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}

            <div className="flex justify-end gap-3">
              {step === "challenges" && (
                <Button
                  variant="outline"
                  onClick={() => setStep("completion")}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
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
                ) : step === "completion" && eligibleChallenges.length > 0 ? (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Save Progress"
                )}
              </Button>
            </div>
          </DialogContent>
        );
      })()}
    </Dialog>
  );
}
