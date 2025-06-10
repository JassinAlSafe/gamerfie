"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChallengeGoal } from "@/types/challenge";
import { Target, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProgressProps {
  goal: ChallengeGoal;
  onProgressUpdate: (goalId: string, progress: number) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function GoalProgress({
  goal,
  onProgressUpdate,
  isLoading,
  className,
}: GoalProgressProps) {
  const [progress, setProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setProgress(value);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setUpdating(true);
      await onProgressUpdate(goal.id, progress);
    } finally {
      setUpdating(false);
    }
  };

  const formatGoalType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase();
  };

  const isCompleted = progress >= 100;

  return (
    <div className={cn("space-y-4 p-4 rounded-lg bg-gray-800/30", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-200">
              {goal.description || formatGoalType(goal.type)}
            </h4>
            <p className="text-sm text-gray-400">
              Target: {goal.target} {formatGoalType(goal.type)}
            </p>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Completed!</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className={cn("h-2", isCompleted ? "bg-green-500/20" : "bg-gray-700")}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Update Progress
          </label>
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={1}
            className="py-4"
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={progress}
            onChange={handleInputChange}
            min={0}
            max={100}
            className="w-24 bg-gray-800/30 border-gray-700/30"
          />
          <Button
            onClick={handleUpdateProgress}
            disabled={isLoading || updating || progress < 0 || progress > 100}
            className="flex-1 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
          >
            {updating || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Progress"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
