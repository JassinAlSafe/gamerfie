"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Game, GameProgress } from "@/types/game";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game;
  progress: Partial<GameProgress>;
  onProgressUpdate: (progress: Partial<GameProgress>) => void;
}

export function CompletionDialog({
  open,
  onOpenChange,
  game,
  progress,
  onProgressUpdate,
}: CompletionDialogProps) {
  const [completionPercentage, setCompletionPercentage] = React.useState(
    progress.completion_percentage ?? 0
  );
  const [playTime, setPlayTime] = React.useState(progress.play_time ?? 0);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setCompletionPercentage(progress.completion_percentage ?? 0);
      setPlayTime(progress.play_time ?? 0);
    }
  }, [open, progress]);

  const handleSave = () => {
    onProgressUpdate({
      completion_percentage: completionPercentage,
      play_time: playTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Update your completion progress for {game.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="playtime"
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Play Time (hours)
              </label>
              <Input
                id="playtime"
                type="number"
                min={0}
                value={playTime}
                onChange={(e) =>
                  setPlayTime(Math.max(0, Number(e.target.value)))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="completion"
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Completion Percentage
              </label>
              <Slider
                id="completion"
                max={100}
                step={1}
                value={[completionPercentage]}
                onValueChange={([value]) => setCompletionPercentage(value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {completionPercentage}% Complete
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Progress</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
