"use client";

import React, { useState, useEffect } from "react";
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";

interface ActivityCommentsProps {
  activity: FriendActivity;
}

export function ActivityComments({ activity }: ActivityCommentsProps) {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { addComment, deleteComment } = useFriendsStore();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [localComments, setLocalComments] = useState(activity.comments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const COMMENTS_TO_SHOW = 3;
  const hasMoreComments = localComments.length > COMMENTS_TO_SHOW;
  const visibleComments = showAllComments
    ? localComments
    : localComments.slice(0, COMMENTS_TO_SHOW);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  useEffect(() => {
    setLocalComments(activity.comments || []);
  }, [activity.comments]);

  const handleComment = async () => {
    if (!userId) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await addComment(activity.id, commentContent.trim());
      setCommentContent("");
      setIsCommentDialogOpen(false);
      toast.success("Comment added");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setIsLoading(true);
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return format(date, "MMM d, yyyy");
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-blue-400 gap-2"
        onClick={() => setIsCommentDialogOpen(true)}
        disabled={isLoading}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">
          {localComments.length > 0
            ? `${localComments.length} Comment${
                localComments.length === 1 ? "" : "s"
              }`
            : "Comment"}
        </span>
      </Button>

      {localComments.length > 0 && (
        <div className="pl-8 mt-4">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
            <div className="space-y-4">
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className="group relative flex gap-3 py-3 hover:bg-gray-800/30 rounded-lg px-3 transition-colors"
                >
                  <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm text-gray-200">
                          {comment.user.username}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatTimestamp(comment.created_at)}
                        </span>
                      </div>
                      {userId === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-400 transition-opacity"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {hasMoreComments && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-blue-400"
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments ? (
                    <>Show Less</>
                  ) : (
                    <>
                      Show {localComments.length - COMMENTS_TO_SHOW} More
                      Comments
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
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
              className="bg-gray-800 border-gray-700 text-white min-h-[100px] resize-none"
              disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={isLoading || !commentContent.trim()}
              className="bg-purple-600 text-white hover:bg-purple-500"
            >
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
