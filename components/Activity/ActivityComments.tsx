"use client";

import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FriendActivity } from "@/types/friend";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface ActivityCommentsProps {
  activity: FriendActivity;
}

export function ActivityComments({ activity }: ActivityCommentsProps) {
  const { data: session } = useSession();
  const { addComment, deleteComment } = useFriendsStore();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const handleComment = async () => {
    if (!session) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    try {
      await addComment(activity.id, commentContent.trim());
      setCommentContent("");
      setIsCommentDialogOpen(false);
      toast.success("Comment added");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-blue-400 gap-2"
        onClick={() => setIsCommentDialogOpen(true)}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">Comment</span>
      </Button>

      {activity.comments && activity.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {activity.comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2 bg-gray-800/30 rounded p-2"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.user.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">
                    {comment.user.username}
                  </span>
                  {session?.user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentDialogOpen(false);
                setCommentContent("");
              }}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={!commentContent.trim()}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
