"use client";

import { useState } from "react";
import { Game, GameStatus } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, Trophy, BookmarkPlus, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useProfile } from "@/hooks/use-profile";
import { useGameDetailsStore } from "@/stores/useGameDetailsStore";
import { useChallengesStore } from "@/stores/useChallengesStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { toast } from "react-hot-toast";

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
  const { updateGameStatus } = useGameDetailsStore();
  const { userChallenges, updateProgress } = useChallengesStore();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSelect = async (status: GameStatus) => {
    console.log("Status selected:", status);
    toast.success(`Selected status: ${status}`);

    setSelectedStatus(status);
    if (status === "completed" || status === "playing") {
      // For these statuses, we'll want to add a comment
      console.log("Status requires comment");
      return;
    }
    await handleSubmit(status);
  };

  const handleSubmit = async (status: GameStatus = selectedStatus!) => {
    if (!profile?.id || !status) {
      console.log("Missing profile or status:", {
        profileId: profile?.id,
        status,
      });
      toast.error("Missing required information");
      return;
    }

    console.log("Starting status update:", {
      profileId: profile.id,
      gameId: game.id,
      status,
    });
    toast.loading("Updating game status...");
    setIsSubmitting(true);

    try {
      const supabase = createClientComponentClient<Database>();
      console.log("Updating game status in database");

      // Update game status
      await updateGameStatus(
        profile.id.toString(),
        game.id.toString(),
        status,
        undefined,
        comment.trim() || undefined
      );
      console.log("Game status updated successfully");

      // Handle challenges if game is completed
      if (status === "completed") {
        console.log("Processing challenges for completed game");
        toast.loading("Processing challenges...");

        const activeGameChallenges = userChallenges.filter(
          (challenge) =>
            challenge.status === "active" &&
            (challenge.goal_type === "complete_games" ||
              challenge.goal_type === "play_time" ||
              challenge.goal_type === "review_games")
        );

        console.log("Active challenges found:", activeGameChallenges.length);

        for (const challenge of activeGameChallenges) {
          console.log("Processing challenge:", challenge.title);

          const participant = challenge.participants.find(
            (p) => p.user.id === profile.id
          );

          if (participant && challenge.goal_type === "complete_games") {
            const genreRequirement =
              challenge.requirements?.genre?.toLowerCase();
            const gameGenres =
              game.genres?.map((g) => g.name.toLowerCase()) || [];

            const normalizeGenre = (genre: string) => {
              genre = genre.toLowerCase();
              if (
                genre.includes("role-playing") ||
                genre.includes("rpg") ||
                genre === "role playing game"
              ) {
                return "rpg";
              }
              return genre;
            };

            const normalizedGameGenres = gameGenres.map(normalizeGenre);
            const normalizedRequirement = genreRequirement
              ? normalizeGenre(genreRequirement)
              : null;

            const matchesRequirement =
              !normalizedRequirement ||
              normalizedGameGenres.includes(normalizedRequirement);

            if (matchesRequirement) {
              const currentCompleted = Math.floor(
                (participant.progress / 100) * challenge.goal_target
              );
              const newCompleted = currentCompleted + 1;
              const newProgress = Math.min(
                100,
                (newCompleted * 100) / challenge.goal_target
              );

              const { error: updateError } = await supabase
                .from("challenge_participants")
                .update({ progress: newProgress })
                .eq("challenge_id", challenge.id)
                .eq("user_id", profile.id);

              if (updateError) throw updateError;

              await updateProgress(challenge.id, newProgress);
            }
          }
        }
      }

      onStatusChange(status);
      setIsOpen(false);
      toast.dismiss(); // Clear any loading toasts
      toast.success(`Game status updated to ${status}`);
      console.log("Status update completed successfully");
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.dismiss(); // Clear any loading toasts
      toast.error("Failed to update game status");
    } finally {
      setIsSubmitting(false);
      setSelectedStatus(null);
      setComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription className="text-gray-400/80 text-sm">
            How would you like to track {game.name}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "relative flex items-center justify-start gap-4 h-auto p-4",
              selectedStatus === "playing" &&
                "border-blue-500/50 bg-blue-500/10"
            )}
            onClick={() => handleStatusSelect("playing")}
            disabled={isSubmitting}
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
              selectedStatus === "completed" &&
                "border-green-500/50 bg-green-500/10"
            )}
            onClick={() => handleStatusSelect("completed")}
            disabled={isSubmitting}
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
              selectedStatus === "want_to_play" &&
                "border-purple-500/50 bg-purple-500/10"
            )}
            onClick={() => handleStatusSelect("want_to_play")}
            disabled={isSubmitting}
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
              selectedStatus === "dropped" && "border-red-500/50 bg-red-500/10"
            )}
            onClick={() => handleStatusSelect("dropped")}
            disabled={isSubmitting}
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
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
