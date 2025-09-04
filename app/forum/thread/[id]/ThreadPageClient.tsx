"use client";

import { useState } from "react";
import { ForumThread, ForumPost, ThreadsWithDetailsResult, PostsWithDetailsResult } from "@/types/forum";
import { ArrowLeft, MessageSquare, Eye, Heart, Clock, User, Send, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { useCsrfProtectedFetch } from "@/hooks/use-csrf-token";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";


interface ThreadPageClientProps {
  thread: ThreadsWithDetailsResult;
  initialPosts: PostsWithDetailsResult[];
}

export function ThreadPageClient({ thread, initialPosts }: ThreadPageClientProps) {
  const router = useRouter();
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const { fetchWithCsrf, isReady } = useCsrfProtectedFetch();
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = isInitialized && !!user;

  const handleCreatePost = async (parentPostId?: string) => {
    if (!newPostContent.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    if (!isReady) {
      toast.error("Please wait for security initialization...");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithCsrf("/api/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: thread.id,
          content: newPostContent,
          parent_post_id: parentPostId || null,
        }),
      });

      if (response.ok) {
        const { post } = await response.json();
        setPosts([...posts, post]);
        setNewPostContent("");
        setReplyingTo(null);
        toast.success("Reply posted successfully!");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (type: 'thread' | 'post', id: string) => {
    if (!isAuthenticated) {
      openDialog({
        defaultTab: "signin",
        actionContext: `to like this ${type}`
      });
      return;
    }

    if (!isReady) {
      toast.error("Please wait...");
      return;
    }

    try {
      const response = await fetchWithCsrf("/api/forum/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, id }),
      });

      if (response.ok) {
        toast.success("Liked!");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to like");
      }
    } catch (error) {
      console.error("Error liking:", error);
      toast.error("Failed to like");
    }
  };

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const getDisplayName = (post: PostsWithDetailsResult) => {
    return post.author_username || "Anonymous";
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
              onClick={() => handleLike('thread', thread.id)}
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
                  onClick={() => handleCreatePost()}
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

        {/* Posts/Replies Section */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
            </h3>
            
            {posts.map((post, index) => (
              <div key={post.id} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-900/40 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-sm font-bold">
                      {getAvatarFallback(getDisplayName(post))}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {getDisplayName(post)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Recently'}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike('post', post.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-sm ${
                          post.likes_count > 0 
                            ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                            : 'text-gray-500 hover:bg-gray-800'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${post.likes_count > 0 ? 'fill-current' : ''}`} />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                          className="text-sm text-gray-500 hover:text-white transition-colors"
                        >
                          Reply
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {replyingTo === post.id && (
                      <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder={`Reply to ${getDisplayName(post)}...`}
                          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none text-sm resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setNewPostContent("");
                            }}
                            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCreatePost(post.id)}
                            disabled={isSubmitting || !newPostContent.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-1 rounded text-sm transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No replies yet
            </h3>
            <p className="text-gray-400 mb-4">
              Be the first to share your thoughts and start the conversation!
            </p>
            {isAuthenticated ? (
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Write First Reply
              </button>
            ) : (
              <button
                onClick={() => openDialog({ defaultTab: "signin", actionContext: "to reply" })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Reply
              </button>
            )}
          </div>
        )}
      </div>

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}