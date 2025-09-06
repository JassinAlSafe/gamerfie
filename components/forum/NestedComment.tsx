"use client";

import { useState } from "react";
import { Heart, MessageSquare, MoreVertical, Reply, ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PostsWithDetailsResult } from "@/types/forum";

interface NestedCommentProps {
  post: PostsWithDetailsResult & { 
    has_children?: boolean;
    is_expanded?: boolean;
    children_loaded?: boolean;
  };
  onReply: (postId: string) => void;
  onLike: (postId: string) => void;
  onToggleExpand: (postId: string) => void;
  onLoadChildren?: (postId: string) => void;
  isAuthenticated: boolean;
  maxDepth?: number;
  currentDepth?: number;
  showReplyForm?: boolean;
  replyContent?: string;
  onReplyContentChange?: (content: string) => void;
  onSubmitReply?: () => void;
  onCancelReply?: () => void;
  isSubmitting?: boolean;
}

export function NestedComment({
  post,
  onReply,
  onLike,
  onToggleExpand,
  onLoadChildren,
  isAuthenticated,
  maxDepth = 5,
  currentDepth = 0,
  showReplyForm = false,
  replyContent = "",
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  isSubmitting = false,
}: NestedCommentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const indentLevel = Math.min(currentDepth, maxDepth);
  const isMaxDepth = currentDepth >= maxDepth;
  
  // Calculate indentation
  const indentStyle = {
    marginLeft: `${indentLevel * 20}px`,
    borderLeft: indentLevel > 0 ? `2px solid rgba(156, 163, 175, 0.2)` : 'none',
    paddingLeft: indentLevel > 0 ? '16px' : '0px',
  };

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return post.author_username || "Anonymous";
  };

  const handleExpandClick = () => {
    if (post.has_children && !post.children_loaded && onLoadChildren) {
      onLoadChildren(post.id);
    }
    onToggleExpand(post.id);
  };

  return (
    <div 
      className="comment-container"
      style={indentStyle}
    >
      <div className={`bg-gray-900/30 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-900/40 transition-colors ${
        isMaxDepth ? 'border-l-purple-500' : ''
      }`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            {post.author_avatar_url ? (
              <img
                src={post.author_avatar_url}
                alt={getDisplayName()}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm font-bold">
                {getAvatarFallback(getDisplayName())}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">
                  {getDisplayName()}
                </span>
                <span className="text-xs text-gray-500">
                  {post.created_at 
                    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) 
                    : 'Recently'
                  }
                </span>
                {post.depth > 0 && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                    @depth {post.depth}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {/* Expand/Collapse button for comments with children */}
                {post.has_children && (
                  <button
                    onClick={handleExpandClick}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-800 rounded"
                  >
                    {post.is_expanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>{post.replies_count || 0} replies</span>
                  </button>
                )}
                
                {/* Menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <MoreVertical className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mb-3">
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs ${
                  post.likes_count > 0 
                    ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                    : 'text-gray-500 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Heart className={`w-3 h-3 ${post.likes_count > 0 ? 'fill-current' : ''}`} />
                <span>{post.likes_count || 0}</span>
              </button>
              
              {isAuthenticated && !isMaxDepth && (
                <button
                  onClick={() => onReply(post.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-white hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
              
              {isMaxDepth && post.has_children && (
                <button
                  onClick={() => {/* Navigate to focused comment view */}}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Continue this thread →
                </button>
              )}
            </div>

            {/* Inline Reply Form */}
            {showReplyForm && onReplyContentChange && onSubmitReply && onCancelReply && (
              <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder={`Reply to ${getDisplayName()}...`}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={onCancelReply}
                    disabled={isSubmitting}
                    className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-sm transition-colors"
                  >
                    {isSubmitting ? "Posting..." : "Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}