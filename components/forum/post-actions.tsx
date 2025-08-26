"use client";

import React from "react";
import { MoreHorizontal, Edit, Flag, Reply, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteButton, useCanDelete } from "./delete-button";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ForumPost } from "@/types/forum";

interface PostActionsProps {
  post: ForumPost;
  /** Whether this is a thread post (original post) */
  isThreadPost?: boolean;
  /** Whether the thread is locked */
  isThreadLocked?: boolean;
  /** Callback when user wants to reply to this post */
  onReply?: () => void;
  /** Callback when user wants to edit this post */
  onEdit?: () => void;
  /** Callback when post is deleted */
  onDeleted?: () => void;
  /** Callback when user likes/unlikes the post */
  onToggleLike?: () => void;
  /** Whether the current user has liked this post */
  isLiked?: boolean;
  /** Show actions in compact mode (fewer visible buttons) */
  compact?: boolean;
}

/**
 * Post actions component with like, reply, edit, delete, and report functionality
 */
export function PostActions({
  post,
  isThreadPost = false,
  isThreadLocked = false,
  onReply,
  onEdit,
  onDeleted,
  onToggleLike,
  isLiked = false,
  compact = false
}: PostActionsProps) {
  const { user, profile } = useAuthStore();
  
  const isAuthor = user?.id === post.author_id;
  const canDelete = useCanDelete(post.author_id, user?.id, profile?.role);
  const canReply = !isThreadLocked && user && !isThreadPost;
  const canEdit = isAuthor && !isThreadLocked;
  const canReport = user && !isAuthor;

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          {post.likes_count || 0}
        </span>
        {post.replies_count !== undefined && (
          <span className="flex items-center gap-1">
            <Reply className="h-4 w-4" />
            {post.replies_count}
          </span>
        )}
      </div>
    );
  }

  // In compact mode, show only essential actions as buttons
  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Like button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLike}
            className={`text-sm ${
              isLiked
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
            {post.likes_count || 0}
          </Button>

          {/* Reply button - only for non-thread posts */}
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit {isThreadPost ? 'thread' : 'post'}
              </DropdownMenuItem>
            )}
            
            {canReport && (
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report {isThreadPost ? 'thread' : 'post'}
              </DropdownMenuItem>
            )}

            {(canEdit || canReport) && canDelete && <DropdownMenuSeparator />}
            
            {canDelete && (
              <DeleteButton
                type={isThreadPost ? 'thread' : 'post'}
                id={post.id}
                isAuthor={isAuthor}
                userRole={profile?.role}
                variant="dropdown"
                onDeleted={onDeleted}
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Full mode - show all actions as buttons
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLike}
          className={`text-sm ${
            isLiked
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {post.likes_count || 0}
          <span className="sr-only">
            {isLiked ? "Unlike" : "Like"} {isThreadPost ? "thread" : "post"}
          </span>
        </Button>

        {/* Reply button - only for non-thread posts */}
        {canReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
        )}

        {/* Reply count display */}
        {post.replies_count !== undefined && post.replies_count > 0 && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Reply className="h-4 w-4" />
            {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Edit button */}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}

        {/* Report button */}
        {canReport && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-yellow-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}

        {/* Delete button */}
        {canDelete && (
          <DeleteButton
            type={isThreadPost ? 'thread' : 'post'}
            id={post.id}
            isAuthor={isAuthor}
            userRole={profile?.role}
            onDeleted={onDeleted}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Simplified post actions for list views
 */
export function PostActionsSimple({
  post,
  onToggleLike,
  isLiked = false,
}: {
  post: Pick<ForumPost, 'id' | 'likes_count' | 'replies_count'>;
  onToggleLike?: () => void;
  isLiked?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <button
        onClick={onToggleLike}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          isLiked ? "text-red-500" : ""
        }`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        {post.likes_count || 0}
      </button>
      
      {post.replies_count !== undefined && (
        <span className="flex items-center gap-1">
          <Reply className="h-4 w-4" />
          {post.replies_count}
        </span>
      )}
    </div>
  );
}