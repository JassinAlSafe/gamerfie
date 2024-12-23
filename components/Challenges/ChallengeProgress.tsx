import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Challenge } from "@/types/challenge";

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
    switch (challenge.goal.type) {
      case "complete_games":
        return Math.round((1 / challenge.goal.target) * 100);
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
    <div className="space-y-4 bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold">Progress Tracking</h3>
        </div>
        {progress >= 100 && (
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Completed!</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button
          onClick={() => handleProgressUpdate(progressIncrement)}
          disabled={isUpdating || progress >= 100}
          className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              {challenge.goal.type === "achieve_score"
                ? "Add 10 Points"
                : "Add Progress"}
            </>
          )}
        </Button>

        {progress > 0 && (
          <Button
            onClick={() => handleProgressUpdate(-progressIncrement)}
            disabled={isUpdating || progress <= 0}
            variant="outline"
            className="border-gray-700/30"
          >
            Undo
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-400 pt-2">
        <p>
          Goal: {challenge.goal.target}{" "}
          {challenge.goal.type === "complete_games"
            ? "games completed"
            : challenge.goal.type === "win_games"
            ? "games won"
            : "points achieved"}
        </p>
      </div>
    </div>
  );
}
