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
  DialogDescription,
} from "@/components/ui/dialog";
import { FriendActivity } from "@/types/friend";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface ActivityCommentsProps {
  activity: FriendActivity;
  showInline?: boolean;
}

export function ActivityComments({
  activity,
  showInline = false,
}: ActivityCommentsProps) {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { addComment, deleteComment } = useFriendsStore();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [localComments, setLocalComments] = useState(activity.comments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const COMMENTS_TO_SHOW = showInline ? 3 : 2;
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

  if (!showInline) {
    return (
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
    );
  }

  return (
    <div className="px-4 py-2">
      {/* Quick Comment Input */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={undefined} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment..."
            className="bg-gray-800 border-gray-700 text-white min-h-[40px] resize-none"
            disabled={isLoading}
            rows={1}
          />
        </div>
        <Button
          onClick={handleComment}
          disabled={isLoading || !commentContent.trim()}
          className="bg-purple-600 text-white hover:bg-purple-500"
          size="sm"
        >
          Post
        </Button>
      </div>

      {/* Comments List */}
      {localComments.length > 0 && (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="group flex gap-3 items-start">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={comment.user.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-medium text-sm text-gray-200">
                      {comment.user.username}
                    </span>
                    <p className="text-sm text-gray-300 break-words">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.created_at)}
                      </span>
                    </div>
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
              </div>
            </div>
          ))}

          {hasMoreComments && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-400 px-0"
              onClick={() => setShowAllComments(!showAllComments)}
            >
              {showAllComments ? (
                <>Show Less</>
              ) : (
                <>View all {localComments.length} comments</>
              )}
            </Button>
          )}
        </div>
      )}

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your thoughts about this activity. Your comment will be
              visible to others.
            </DialogDescription>
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
