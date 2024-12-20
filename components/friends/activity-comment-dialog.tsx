"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FriendActivity } from "@/types/friend";
import { useFriendsStore } from "@/stores/useFriendsStore";

interface ActivityCommentDialogProps {
  activity: FriendActivity;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityCommentDialog({
  activity,
  isOpen,
  onClose,
}: ActivityCommentDialogProps) {
  const [comment, setComment] = useState(activity.details?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createActivity } = useFriendsStore();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await createActivity(activity.type, activity.game.id, {
        comment: comment.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating activity comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a comment to your activity for {activity.game.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your thoughts about this game..."
            className="bg-gray-800 border-gray-700 text-white"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-purple-600 text-white hover:bg-purple-500"
          >
            {isSubmitting ? "Saving..." : "Save Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
