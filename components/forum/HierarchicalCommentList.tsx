"use client";

import { useState, useCallback } from "react";
import { NestedComment } from "./NestedComment";
import { MessageSquare } from "lucide-react";
import type { PostsWithDetailsResult } from "@/types/forum";

interface CommentTreeNode extends PostsWithDetailsResult {
  children?: CommentTreeNode[];
  has_children?: boolean;
  is_expanded?: boolean;
  children_loaded?: boolean;
  level_path?: number[];
  path?: string;
}

interface HierarchicalCommentListProps {
  posts: PostsWithDetailsResult[];
  onReply: (content: string, parentId?: string) => Promise<void>;
  onLike: (postId: string) => Promise<void>;
  onLoadMoreReplies?: (postId: string) => Promise<void>;
  isAuthenticated: boolean;
  maxDepth?: number;
  loading?: boolean;
}

export function HierarchicalCommentList({
  posts,
  onReply,
  onLike,
  onLoadMoreReplies,
  isAuthenticated,
  maxDepth = 5,
  loading = false,
}: HierarchicalCommentListProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build hierarchical tree from flat posts array
  const buildCommentTree = useCallback((flatPosts: PostsWithDetailsResult[]): CommentTreeNode[] => {
    const postMap = new Map<string, CommentTreeNode>();
    const rootPosts: CommentTreeNode[] = [];

    // First pass: Create all nodes
    flatPosts.forEach(post => {
      const node: CommentTreeNode = {
        ...post,
        children: [],
        has_children: (post.replies_count || 0) > 0,
        is_expanded: expandedPosts.has(post.id),
        children_loaded: true, // Since we have the data
      };
      postMap.set(post.id, node);
    });

    // Second pass: Build parent-child relationships
    flatPosts.forEach(post => {
      const node = postMap.get(post.id)!;
      
      if (post.parent_post_id && postMap.has(post.parent_post_id)) {
        const parent = postMap.get(post.parent_post_id)!;
        parent.children!.push(node);
      } else {
        rootPosts.push(node);
      }
    });

    // Sort children by creation date
    const sortChildren = (nodes: CommentTreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          sortChildren(node.children);
        }
      });
    };

    rootPosts.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sortChildren(rootPosts);

    return rootPosts;
  }, [expandedPosts]);

  const handleToggleExpand = useCallback((postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleReply = useCallback((postId: string) => {
    setReplyingTo(replyingTo === postId ? null : postId);
    setReplyContent("");
  }, [replyingTo]);

  const handleSubmitReply = useCallback(async () => {
    if (!replyContent.trim() || !replyingTo) return;

    setIsSubmitting(true);
    try {
      await onReply(replyContent, replyingTo);
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [replyContent, replyingTo, onReply]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent("");
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    try {
      await onLike(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  }, [onLike]);

  const renderCommentNode = useCallback((
    node: CommentTreeNode, 
    depth: number = 0
  ): React.ReactNode => {
    const showChildren = node.is_expanded && node.children && node.children.length > 0;
    const isAtMaxDepth = depth >= maxDepth;

    return (
      <div key={node.id} className="comment-thread">
        <NestedComment
          post={node}
          onReply={handleReply}
          onLike={handleLike}
          onToggleExpand={handleToggleExpand}
          onLoadChildren={onLoadMoreReplies}
          isAuthenticated={isAuthenticated}
          maxDepth={maxDepth}
          currentDepth={depth}
          showReplyForm={replyingTo === node.id}
          replyContent={replyContent}
          onReplyContentChange={setReplyContent}
          onSubmitReply={handleSubmitReply}
          onCancelReply={handleCancelReply}
          isSubmitting={isSubmitting}
        />

        {/* Render children if expanded and not at max depth */}
        {showChildren && !isAtMaxDepth && (
          <div className="nested-children mt-2">
            {node.children!.map(child => renderCommentNode(child, depth + 1))}
          </div>
        )}

        {/* Show "Continue thread" link if at max depth with children */}
        {isAtMaxDepth && node.has_children && (
          <div className="mt-2 ml-6 pl-4 border-l-2 border-gray-700">
            <button
              onClick={() => {/* Navigate to focused view */}}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Continue this thread ({node.replies_count || 0} more replies)
            </button>
          </div>
        )}
      </div>
    );
  }, [
    handleReply, 
    handleLike, 
    handleToggleExpand, 
    onLoadMoreReplies, 
    isAuthenticated, 
    maxDepth, 
    replyingTo, 
    replyContent, 
    handleSubmitReply, 
    handleCancelReply, 
    isSubmitting
  ]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No replies yet
        </h3>
        <p className="text-gray-400">
          Be the first to share your thoughts and start the conversation!
        </p>
      </div>
    );
  }

  const commentTree = buildCommentTree(posts);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">
          {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
        </h3>
      </div>

      <div className="comment-tree space-y-3">
        {commentTree.map(node => renderCommentNode(node, 0))}
      </div>
    </div>
  );
}