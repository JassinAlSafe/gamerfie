"use client";

import { useState } from "react";
import { Game, GameStatus } from "@/types/game";
import { useProgressStore } from "@/stores/useProgressStore";
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
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle, Trophy, BookmarkPlus, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusSelect: (status: GameStatus) => void;
  currentStatus: GameStatus | null;
  isLoading: boolean;
  gameName: string;
}

export function StatusDialog({
  isOpen,
  onClose,
  onStatusSelect,
  currentStatus,
  isLoading,
  gameName,
}: StatusDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription className="text-gray-400/80 text-sm">
            How would you like to track {gameName}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "relative flex items-center justify-start gap-4 h-auto p-4",
              currentStatus === "playing" && "border-blue-500/50 bg-blue-500/10"
            )}
            onClick={() => onStatusSelect("playing")}
            disabled={isLoading}
          >
            <PlayCircle className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">Currently Playing</span>
              <span className="text-sm text-gray-400">
                Track your progress as you play through the game
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={cn(
              "relative flex items-center justify-start gap-4 h-auto p-4",
              currentStatus === "completed" &&
                "border-green-500/50 bg-green-500/10"
            )}
            onClick={() => onStatusSelect("completed")}
            disabled={isLoading}
          >
            <Trophy className="w-5 h-5 text-green-400" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">Completed</span>
              <span className="text-sm text-gray-400">
                Mark as finished and share your completion details
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={cn(
              "relative flex items-center justify-start gap-4 h-auto p-4",
              currentStatus === "want_to_play" &&
                "border-purple-500/50 bg-purple-500/10"
            )}
            onClick={() => onStatusSelect("want_to_play")}
            disabled={isLoading}
          >
            <BookmarkPlus className="w-5 h-5 text-purple-400" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">Want to Play</span>
              <span className="text-sm text-gray-400">
                Add to your backlog to play later
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className={cn(
              "relative flex items-center justify-start gap-4 h-auto p-4",
              currentStatus === "dropped" && "border-red-500/50 bg-red-500/10"
            )}
            onClick={() => onStatusSelect("dropped")}
            disabled={isLoading}
          >
            <Ban className="w-5 h-5 text-red-400" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">Dropped</span>
              <span className="text-sm text-gray-400">
                Mark as abandoned or on hold
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
