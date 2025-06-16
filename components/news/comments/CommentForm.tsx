"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { CreateNewsComment, NewsComment } from "@/types/news";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: NewsComment) => void;
  isAuthenticated: boolean;
  className?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  onCommentAdded,
  isAuthenticated,
  className
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: "Error",
        description: "Comment is too long (max 1000 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const commentData: CreateNewsComment = {
        post_id: postId,
        content: content.trim(),
      };

      const response = await fetch(`/api/news/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const { comment } = await response.json();
      
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });

      setContent("");
      onCommentAdded(comment);
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center ${className}`}>
        <MessageCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Join the conversation
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign in to share your thoughts and engage with the community.
        </p>
        <Button asChild>
          <a href="/signin">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add a comment
        </label>
        <Textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {content.length}/1000 characters
          </span>
          {content.length > 900 && (
            <span className={content.length > 1000 ? "text-red-500" : "text-yellow-500"}>
              {content.length > 1000 ? "Too long!" : "Approaching limit"}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim() || content.length > 1000}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;