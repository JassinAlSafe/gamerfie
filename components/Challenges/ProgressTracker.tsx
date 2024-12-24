"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressTrackerProps {
  challengeId: string;
  currentProgress: number;
  onProgressUpdate: (progress: number) => Promise<void>;
  isLoading: boolean;
}

export function ProgressTracker({
  challengeId,
  currentProgress,
  onProgressUpdate,
  isLoading,
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState(currentProgress);
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
      await onProgressUpdate(progress);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-200">
            Your Progress
          </label>
          <span className="text-sm text-gray-400">{progress}%</span>
        </div>
        <Progress value={progress} />
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
            disabled={
              isLoading ||
              updating ||
              progress === currentProgress ||
              progress < 0 ||
              progress > 100
            }
            className="flex-1"
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
