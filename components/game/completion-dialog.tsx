"use client";

import { useState, useEffect, useCallback } from "react";
import { Game } from "@/types/game";
import { useProgressStore } from "@/stores/useProgressStore";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { Clock, Trophy, Target, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Challenge } from "@/types/challenge";

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  isLoading: boolean;
  totalAchievements?: number;
}

export function CompletionDialog({
  isOpen,
  onClose,
  onComplete,
  isLoading,
  totalAchievements = 0,
}: CompletionDialogProps) {
  const [playTime, setPlayTime] = useState<number | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<
    number | null
  >(null);
  const [localAchievementsCompleted, setLocalAchievementsCompleted] =
    useState<number>(0);

  const handleSubmit = useCallback(() => {
    onComplete({
      playTime,
      completionPercentage,
      achievementsCompleted: localAchievementsCompleted,
    });
  }, [playTime, completionPercentage, localAchievementsCompleted]);

  const achievementPercentage =
    totalAchievements > 0
      ? (localAchievementsCompleted / totalAchievements) * 100
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game Completion Details</DialogTitle>
          <DialogDescription>
            Add details about your completion of this game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Play Time (hours)</Label>
            <Input
              type="number"
              min={0}
              value={playTime || ""}
              onChange={(e) => setPlayTime(Number(e.target.value) || null)}
              placeholder="Enter play time in hours"
            />
          </div>

          <div className="space-y-2">
            <Label>Completion Percentage</Label>
            <div className="flex items-center gap-4">
              <Input
                type="range"
                min={0}
                max={100}
                value={completionPercentage || 0}
                onChange={(e) =>
                  setCompletionPercentage(Number(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12">
                {completionPercentage || 0}%
              </span>
            </div>
          </div>

          {totalAchievements > 0 && (
            <div className="space-y-2">
              <Label>Achievements Completed</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min={0}
                  max={totalAchievements}
                  value={localAchievementsCompleted}
                  onChange={(e) =>
                    setLocalAchievementsCompleted(Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 w-24">
                  {localAchievementsCompleted} / {totalAchievements} (
                  {achievementPercentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
