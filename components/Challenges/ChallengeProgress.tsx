import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Challenge } from "@/types/challenge";
import Image from "next/image";

interface ChallengeProgressProps {
  challenge: Challenge;
  currentProgress: number;
  onProgressUpdate: (progress: number) => Promise<void>;
}

export function ChallengeProgress({
  challenge,
  currentProgress,
  onProgressUpdate,
}: ChallengeProgressProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleProgressUpdate = async (increment: number) => {
    try {
      setIsUpdating(true);
      const newProgress = Math.min(Math.max(progress + increment, 0), 100);
      await onProgressUpdate(newProgress);
      setProgress(newProgress);

      if (newProgress >= 100) {
        toast({
          title: "Challenge Completed! 🎉",
          description:
            "Congratulations! You've completed the challenge and earned rewards!",
        });
      } else {
        toast({
          title: "Progress Updated",
          description: `Your progress has been updated to ${newProgress}%`,
        });
      }
    } catch (error) {
      console.error("Failed to update challenge progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateProgressIncrement = () => {
    switch (challenge.goal?.type) {
      case "complete_games":
        return Math.round((1 / challenge.goal?.target) * 100);
      case "win_games":
        return Math.round((1 / challenge.goal.target) * 100);
      case "achieve_score":
        return Math.round((10 / challenge.goal.target) * 100); // Increment by 10 points
      default:
        return 10; // Default increment
    }
  };

  const progressIncrement = calculateProgressIncrement();

  return (
    <div className="space-y-6 bg-muted/50 rounded-xl border border-border/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Challenge Progress</h3>
            <p className="text-muted-foreground">
              Track your journey to completion
            </p>
          </div>
        </div>
        {progress >= 100 && (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Challenge Complete!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span>Goal Target</span>
            </div>
            <p className="text-lg font-medium">
              {challenge.goal?.target} {challenge.goal?.type.replace(/_/g, " ")}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Current Progress</span>
            </div>
            <p className="text-lg font-medium">
              {Math.floor((progress / 100) * (challenge.goal?.target || 0))}{" "}
              {challenge.goal?.type.replace(/_/g, " ")}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span>Remaining</span>
            </div>
            <p className="text-lg font-medium">
              {Math.ceil(
                (challenge.goal?.target || 0) -
                  (progress / 100) * (challenge.goal?.target || 0)
              )}{" "}
              {challenge.goal?.type.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button
          onClick={() => handleProgressUpdate(progressIncrement)}
          disabled={isUpdating || progress >= 100}
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              {challenge.goals?.[0]?.type === "achieve_score"
                ? "Add 10 Points"
                : "Update Progress"}
            </>
          )}
        </Button>

        {progress > 0 && (
          <Button
            onClick={() => handleProgressUpdate(-progressIncrement)}
            disabled={isUpdating || progress <= 0}
            variant="outline"
            className="border-border/30"
          >
            Undo Last Update
          </Button>
        )}
      </div>

      {progress >= 100 && challenge.badge && (
        <div className="bg-primary/5 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/50 backdrop-blur-sm p-2">
              {challenge.badge.icon_url?.endsWith(".svg") ? (
                <Image
                  src={challenge.badge.icon_url}
                  alt={challenge.badge.name}
                  fill
                  sizes="(max-width: 64px) 100vw, 64px"
                  className="object-contain p-1"
                />
              ) : (
                <Image
                  src={challenge.badge.icon_url || ""}
                  alt={challenge.badge.name}
                  fill
                  sizes="(max-width: 64px) 100vw, 64px"
                  className="object-contain p-1"
                />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg">Badge Earned!</h4>
              <p className="text-muted-foreground">
                Congratulations! You've earned the {challenge.badge.name} badge.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
