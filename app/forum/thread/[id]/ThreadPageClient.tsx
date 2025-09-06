"use client";

import { useState } from "react";
import { ThreadsWithDetailsResult, PostsWithDetailsResult } from "@/types/forum";
import { ArrowLeft, MessageSquare, Eye, Heart, Clock, User, Send, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { useForum } from "@/hooks/forum/use-forum";
import { HierarchicalCommentList } from "@/components/forum/HierarchicalCommentList";
import { formatDistanceToNow } from "date-fns";

interface ThreadPageClientProps {
  thread: ThreadsWithDetailsResult;
  initialPosts: PostsWithDetailsResult[];
}

export function ThreadPageClient({ thread: initialThread, initialPosts }: ThreadPageClientProps) {
  const router = useRouter();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const [newPostContent, setNewPostContent] = useState("");

  // Use the composite forum hook for all forum operations
  const {
    thread,
    posts,
    isLoadingPosts,
    isSubmitting,
    createPost: handleCreatePost,
    likePost: handleLike,
    likeThread: handleThreadLike,
    isAuthenticated,
  } = useForum({
    thread: initialThread,
    initialPosts,
  });

  const handleMainPostSubmit = async () => {
    await handleCreatePost(newPostContent);
    setNewPostContent("");
  };

  // Wrapper for thread like to handle onClick event
  const onThreadLikeClick = () => {
    handleThreadLike(thread.id);
  };

  // Wrapper for post like to match the expected signature
  const onPostLike = async (postId: string): Promise<void> => {
    await handleLike(postId);
  };

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <button
          onClick={() => router.push("/forum")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </button>

        {/* Thread Header */}
        <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">{thread.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">
                    {getAvatarFallback(thread.author_username)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {thread.author_username || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {thread.created_at ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true }) : 'Recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-auto text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{thread.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{thread.replies_count || posts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div className="border-t border-gray-700/50 pt-4 mb-4">
            <p className="text-gray-300 whitespace-pre-wrap">{thread.content}</p>
          </div>

          {/* Thread Actions */}
          <div className="flex items-center justify-between border-t border-gray-700/50 pt-4">
            <button
              onClick={onThreadLikeClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                thread.likes_count > 0 
                  ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${thread.likes_count > 0 ? 'fill-current' : ''}`} />
              <span>{thread.likes_count || 0}</span>
            </button>
            <span className="text-xs text-gray-500">
              Started a discussion
            </span>
          </div>
        </div>

        {/* Reply Section for Authenticated Users */}
        {isAuthenticated && !thread.is_locked && (
          <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Write a Reply
            </h3>
            <div className="space-y-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows={4}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleMainPostSubmit}
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Prompt for Anonymous Users */}
        {!isAuthenticated && (
          <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8 mb-6 text-center">
            <div className="max-w-md mx-auto">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Join the Discussion
              </h3>
              <p className="text-gray-400 mb-6">
                Sign in to share your thoughts and connect with the gaming community.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => openDialog({ defaultTab: "signin", actionContext: "to join the discussion" })}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => openDialog({ defaultTab: "signup", actionContext: "to join the discussion" })}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hierarchical Posts/Replies Section */}
        <HierarchicalCommentList
          posts={posts}
          onReply={handleCreatePost}
          onLike={onPostLike}
          isAuthenticated={isAuthenticated}
          maxDepth={5}
          loading={isLoadingPosts}
        />
      </div>

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}