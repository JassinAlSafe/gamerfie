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
import { Game } from "@/types";
import { PlayCircle, Trophy, BookmarkPlus, Ban } from "lucide-react";

// Define GameStatus type locally
type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game;
  currentStatus: GameStatus;
  onStatusUpdate: (status: GameStatus) => void;
}

export function StatusDialog({
  open,
  onOpenChange,
  game,
  currentStatus,
  onStatusUpdate,
}: StatusDialogProps) {
  const statuses: {
    value: GameStatus;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "playing",
      label: "Currently Playing",
      icon: <PlayCircle className="w-5 h-5 text-blue-400" />,
      description: "Mark this game as currently being played",
    },
    {
      value: "completed",
      label: "Completed",
      icon: <Trophy className="w-5 h-5 text-green-400" />,
      description: "Mark this game as completed",
    },
    {
      value: "want_to_play",
      label: "Want to Play",
      icon: <BookmarkPlus className="w-5 h-5 text-purple-400" />,
      description: "Add this game to your wishlist",
    },
    {
      value: "dropped",
      label: "Dropped",
      icon: <Ban className="w-5 h-5 text-red-400" />,
      description: "Mark this game as dropped or abandoned",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription>
            Choose a status for {game.name}. Your current status is{" "}
            {currentStatus || "not set"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {statuses.map((status) => (
            <Button
              key={status.value}
              onClick={() => onStatusUpdate(status.value)}
              variant={currentStatus === status.value ? "default" : "outline"}
              className="w-full justify-start gap-2"
              aria-label={status.description}
            >
              {status.icon}
              {status.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
