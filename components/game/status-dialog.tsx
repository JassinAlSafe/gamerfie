"use client";

import { useState } from "react";
import { Game } from "@/types/game";

// Define GameStatus locally to avoid import issues
type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";
import { useProgressStore } from "@/stores/useProgressStore";
import { useProfile } from "@/hooks/Profile/use-profile";
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
import { Textarea } from "@/components/ui/text/textarea";
import { PlayCircle, Trophy, BookmarkPlus, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      await updateGameStatus(profile.id.toString(), game.id.toString(), status);

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
    colorClass: string,
    description: string
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Button
        onClick={() => handleStatusSelect(status)}
        variant="ghost"
        className={cn(
          "w-full flex items-center justify-between p-4 relative group transition-all duration-300",
          "hover:bg-gray-800/30 rounded-lg h-auto",
          colorClass
        )}
        disabled={isSubmitting}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-medium text-white">{label}</span>
          <p className="text-sm text-gray-400/80">{description}</p>
        </div>
        <div className="flex-shrink-0 ml-4">{icon}</div>
      </Button>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[440px] bg-[#1a1b1e] border-gray-800/50">
        <DialogHeader className="space-y-2.5 text-left">
          <DialogTitle className="text-xl font-semibold text-white">
            Add to Collection
          </DialogTitle>
          <DialogDescription className="text-gray-400/80 text-sm">
            How would you like to track {game.name}?
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedStatus ? (
            <motion.div
              key="status-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 py-4"
            >
              {renderStatusButton(
                "want_to_play",
                <BookmarkPlus className="w-5 h-5 text-purple-400/90" />,
                "Want to Play",
                "text-purple-400/90",
                "Save for later"
              )}
              {renderStatusButton(
                "playing",
                <PlayCircle className="w-5 h-5 text-blue-400/90" />,
                "Currently Playing",
                "text-blue-400/90",
                "Track your progress"
              )}
              {renderStatusButton(
                "completed",
                <Trophy className="w-5 h-5 text-green-400/90" />,
                "Completed",
                "text-green-400/90",
                "Share your experience"
              )}
              {renderStatusButton(
                "dropped",
                <Ban className="w-5 h-5 text-red-400/90" />,
                "Dropped",
                "text-red-400/90",
                "Not for you"
              )}
            </motion.div>
          ) : (
            <motion.div
              key="comment-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2.5">
                <h4 className="text-sm font-medium text-gray-300/90">
                  Add a note (optional)
                </h4>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="bg-gray-800/30 border-gray-700/30 text-white min-h-[100px] resize-none text-sm w-full"
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 items-stretch">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedStatus(null)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/30 w-full sm:w-auto"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className={cn(
                    "text-white px-4 w-full sm:w-auto",
                    selectedStatus === "want_to_play" &&
                      "bg-purple-500/70 hover:bg-purple-500/90",
                    selectedStatus === "playing" &&
                      "bg-blue-500/70 hover:bg-blue-500/90",
                    selectedStatus === "completed" &&
                      "bg-green-500/70 hover:bg-green-500/90",
                    selectedStatus === "dropped" &&
                      "bg-red-500/70 hover:bg-red-500/90"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2 w-full">
                      <LoadingSpinner size="sm" />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    "Add to Collection"
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
