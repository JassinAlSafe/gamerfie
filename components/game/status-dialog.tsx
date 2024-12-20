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

interface StatusDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  game: Game;
  onStatusChange: (status: GameStatus) => void;
}

export function StatusDialog({
  isOpen,
  setIsOpen,
  game,
  onStatusChange,
}: StatusDialogProps) {
  const { profile } = useProfile();
  const { updateGameStatus } = useProgressStore();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSelect = async (status: GameStatus) => {
    setSelectedStatus(status);
    if (status === "completed" || status === "playing") {
      // For these statuses, we'll want to add a comment
      return;
    }
    await handleSubmit(status);
  };

  const handleSubmit = async (status: GameStatus = selectedStatus!) => {
    if (!profile?.id || !status) return;

    setIsSubmitting(true);

    try {
      await updateGameStatus(
        profile.id.toString(),
        game.id.toString(),
        status,
        undefined,
        comment.trim() || undefined
      );

      onStatusChange(status);
      setIsOpen(false);
      toast.success(`Game status updated to ${status}`);
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.error("Failed to update game status");
    } finally {
      setIsSubmitting(false);
      setSelectedStatus(null);
      setComment("");
    }
  };

  const renderStatusButton = (
    status: GameStatus,
    icon: React.ReactNode,
    label: string,
    colorClass: string
  ) => (
    <Button
      onClick={() => handleStatusSelect(status)}
      variant="outline"
      size="lg"
      className={`w-full flex items-center justify-start space-x-2 py-6 ${colorClass}`}
      disabled={isSubmitting}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription>Choose a status for {game.name}</DialogDescription>
        </DialogHeader>

        {!selectedStatus ? (
          <div className="grid gap-4 py-4">
            {renderStatusButton(
              "want_to_play",
              <BookmarkPlus className="w-5 h-5 text-purple-400" />,
              "Want to Play",
              "hover:border-purple-500/50"
            )}
            {renderStatusButton(
              "playing",
              <PlayCircle className="w-5 h-5 text-blue-400" />,
              "Currently Playing",
              "hover:border-blue-500/50"
            )}
            {renderStatusButton(
              "completed",
              <Trophy className="w-5 h-5 text-green-400" />,
              "Completed",
              "hover:border-green-500/50"
            )}
            {renderStatusButton(
              "dropped",
              <Ban className="w-5 h-5 text-red-400" />,
              "Dropped",
              "hover:border-red-500/50"
            )}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Add a comment about why you're marking this game as ${selectedStatus}...`}
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedStatus(null)}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="bg-purple-600 text-white hover:bg-purple-500"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  "Save Status"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
