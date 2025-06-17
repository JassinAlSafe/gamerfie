"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  MessageCircle, 
  RefreshCw, 
  Send, 
  User, 
  Calendar,
  MoreHorizontal,
  Edit3,
  Trash2,
  Check,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";

interface PlaylistComment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  playlist_id: string;
  parent_id?: string | null;
  is_edited?: boolean;
  like_count?: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    display_name?: string;
  };
}

interface PlaylistCommentsSectionProps {
  playlistId: string;
  className?: string;
}

const PlaylistCommentsSection: React.FC<PlaylistCommentsSectionProps> = ({
  playlistId,
  className
}) => {
  const [comments, setComments] = useState<PlaylistComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const { toast } = useToast();

  const fetchComments = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      const response = await fetch(`/api/playlists/${playlistId}/comments?page=${page}&limit=20`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      
      if (reset || page === 1) {
        setComments(data.comments || []);
      } else {
        setComments(prev => [...prev, ...(data.comments || [])]);
      }

      setHasMore(data.hasMore || false);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchComments(1, true);
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (newComment.length > 1000) {
      toast({
        title: "Error",
        description: "Comment is too long (max 1000 characters)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/playlists/${playlistId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
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

      setNewComment("");
      setComments(prev => [comment, ...prev]);
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

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || editContent === comments.find(c => c.id === commentId)?.content) {
      setEditingComment(null);
      setEditContent("");
      return;
    }

    try {
      const response = await fetch(`/api/playlists/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      const { comment: updatedComment } = await response.json();
      
      toast({
        title: "Success",
        description: "Comment updated successfully!",
      });

      setEditingComment(null);
      setEditContent("");
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchComments(currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    fetchComments(1, true);
  };

  const startEdit = (comment: PlaylistComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-comment" className="block text-sm font-medium text-white/80">
              Add a comment
            </label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this playlist..."
              rows={4}
              className="resize-none bg-white/5 border-white/10 text-white placeholder:text-white/50"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-sm text-white/60">
              <span>
                {newComment.length}/1000 characters
              </span>
              {newComment.length > 900 && (
                <span className={newComment.length > 1000 ? "text-red-400" : "text-yellow-400"}>
                  {newComment.length > 1000 ? "Too long!" : "Approaching limit"}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim() || newComment.length > 1000}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
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
      ) : (
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-white/40" />
          <h3 className="font-semibold text-white mb-2">
            Join the conversation
          </h3>
          <p className="text-white/60 mb-4">
            Sign in to share your thoughts about this playlist.
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <a href="/signin">Sign In</a>
          </Button>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Try Again
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h4 className="text-lg font-medium text-white mb-2">
              No comments yet
            </h4>
            <p className="text-white/60">
              Be the first to share your thoughts about this playlist!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage 
                        src={comment.user?.avatar_url || undefined} 
                        alt={comment.user?.display_name || comment.user?.username || 'User'} 
                      />
                      <AvatarFallback className="bg-white/10">
                        <User className="w-4 h-4 text-white/60" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-white">
                          {comment.user?.display_name || comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(comment.created_at)}
                          {comment.is_edited && (
                            <span className="italic">(edited)</span>
                          )}
                        </span>
                      </div>
                      
                      {editingComment === comment.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="resize-none text-sm bg-white/5 border-white/10 text-white"
                            rows={3}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/60">
                              {editContent.length}/1000 characters
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editContent.trim() || editContent.length > 1000}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white/80 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {user && (user.id === comment.user_id) && editingComment !== comment.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-white/10">
                        <DropdownMenuItem onClick={() => startEdit(comment)} className="text-white hover:bg-white/10">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center pt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Comments'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistCommentsSection;