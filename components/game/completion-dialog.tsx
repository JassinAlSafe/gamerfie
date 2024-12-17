"use client";

import { useState, useEffect } from 'react';
import { Game } from '@/types/game';
import { useProgressStore } from '@/stores/useProgressStore';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/loadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { Clock, Trophy, BarChart3, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CompletionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
}

export function CompletionDialog({ isOpen, setIsOpen, game }: CompletionDialogProps) {
  const { profile } = useProfile();
  const { updateProgress, fetchProgress } = useProgressStore();
  const [localPlayTime, setLocalPlayTime] = useState(0);
  const [localCompletion, setLocalCompletion] = useState(0);
  const [localAchievementsCompleted, setLocalAchievementsCompleted] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id && game?.id) {
      fetchProgress(profile.id.toString(), game.id.toString());
    }
  }, [profile?.id, game?.id, fetchProgress]);

  const totalAchievements = game.achievements?.length || 0;
  const achievementPercentage = totalAchievements > 0 
    ? (localAchievementsCompleted / totalAchievements) * 100 
    : 0;

  const handleSubmit = async () => {
    if (!profile?.id) return;
    
    setIsSubmitting(true);
    
    try {
      await updateProgress(profile.id, game.id.toString(), {
        play_time: localPlayTime,
        completion_percentage: localCompletion,
        achievements_completed: localAchievementsCompleted,
        status: localCompletion === 100 ? 'completed' : 'playing',
        completed_at: localCompletion === 100 ? new Date().toISOString() : null,
      });
      
      await fetchProgress(profile.id.toString(), game.id.toString());
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* Overall Completion */}
          <div className="space-y-4">
            <Label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Overall Completion
              </div>
              <span className={cn(
                "text-sm font-medium",
                localCompletion === 100 ? "text-green-400" :
                localCompletion >= 75 ? "text-blue-400" :
                localCompletion >= 50 ? "text-purple-400" :
                localCompletion >= 25 ? "text-orange-400" : "text-red-400"
              )}>
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
                localCompletion === 100 ? "[&_[role=slider]]:bg-green-500" :
                localCompletion >= 75 ? "[&_[role=slider]]:bg-blue-500" :
                localCompletion >= 50 ? "[&_[role=slider]]:bg-purple-500" :
                localCompletion >= 25 ? "[&_[role=slider]]:bg-orange-500" : 
                "[&_[role=slider]]:bg-red-500"
              )}
            />
            <ProgressIndicator value={localCompletion} className="transition-all duration-300" />
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
                onChange={(e) => setLocalAchievementsCompleted(Number(e.target.value))}
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
            <h4 className="text-sm font-medium text-gray-300">Status Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Overall Progress</p>
                <p className={cn(
                  "font-medium",
                  localCompletion === 100 ? "text-green-400" :
                  localCompletion >= 75 ? "text-blue-400" :
                  localCompletion >= 50 ? "text-purple-400" :
                  localCompletion >= 25 ? "text-orange-400" : "text-red-400"
                )}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
              'Save Progress'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 