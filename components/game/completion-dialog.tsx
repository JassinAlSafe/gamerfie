"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from '@/stores/useLibraryStore';
import { Game } from '@/types/game';
import { Star, Clock } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface CompletionDialogProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionDialog({ game, isOpen, onClose }: CompletionDialogProps) {
  const { updateGame } = useLibraryStore();
  const [playStatus, setPlayStatus] = useState<Game['playStatus']>(game.playStatus || 'notStarted');
  const [playTime, setPlayTime] = useState(game.playTime || 0);
  const [rating, setRating] = useState(game.rating || 0);

  const handleSave = async () => {
    try {
      await updateGame(game.id, {
        playStatus,
        playTime,
        rating,
        completed: playStatus === 'completed',
        completedAt: playStatus === 'completed' ? Date.now() : undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to update game:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Game Progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Play Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['notStarted', 'inProgress', 'completed', 'abandoned'].map((status) => (
                <Button
                  key={status}
                  variant={playStatus === status ? "default" : "outline"}
                  onClick={() => setPlayStatus(status as Game['playStatus'])}
                  className="capitalize"
                >
                  {status.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Play Time (hours)</label>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <input
                type="number"
                value={playTime}
                onChange={(e) => setPlayTime(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded bg-gray-800"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <Slider
                value={[rating]}
                onValueChange={([value]) => setRating(value)}
                max={10}
                step={0.5}
                className="w-[200px]"
              />
              <span className="w-12 text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Progress</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 