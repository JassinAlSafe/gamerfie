"use client";

import { useState } from "react";
import { ForumThread, ForumPost } from "@/types/forum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Eye, Pin, Lock, Send, Reply, LogIn, Heart, Clock, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { cn } from "@/lib/utils";

// API response post structure (flat fields)
interface PostFromAPI {
  id: string;
  thread_id: string;
  thread_title?: string;
  content: string;
  author_id: string;
  author_username?: string;
  author_avatar_url?: string;
  likes_count: number;
  is_liked?: boolean;
  parent_post_id?: string | null;
  replies_count: number;
  depth: number;
  is_thread_locked?: boolean;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

interface ThreadPageClientProps {
  thread: ForumThread;
  initialPosts: (ForumPost | PostFromAPI)[];
}

export function ThreadPageClient({ thread, initialPosts }: ThreadPageClientProps) {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { openDialog, Dialog } = useAuthDialog();
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = isInitialized && !!user;

  const handleCreatePost = async (parentPostId?: string) => {
    if (!newPostContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/forum/posts", {
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
        // Add the new post to the list
        setPosts([...posts, post]);
        setNewPostContent("");
        setReplyingTo(null);
        // Refresh the page to get updated data
        router.refresh();
      } else {
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
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

    try {
      const response = await fetch("/api/forum/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          id,
        }),
      });

      if (response.ok) {
        // Refresh to get updated like counts
        router.refresh();
      }
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (post: any) => {
    // Handle both nested author object and flat fields
    return post.author?.username || post.author_username || post.author?.display_name || "Anonymous User";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground">
      <div className="container mx-auto px-4 pt-20 pb-6 max-w-6xl">
        {/* Navigation Bar */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Back to Forum
          </Button>
        </div>

        {/* Thread Header - Hero Section */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              {/* Thread Status Indicators */}
              <div className="flex items-center gap-2 mb-3">
                {thread.is_pinned && (
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
                {thread.category && (
                  <Link href={`/forum/category/${thread.category_id}`}>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40 transition-all duration-200"
                    >
                      <span className="mr-1">{thread.category.icon}</span>
                      {thread.category.name}
                    </Badge>
                  </Link>
                )}
              </div>

              {/* Thread Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
                {thread.title}
              </h1>

              {/* Author & Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700">
                    <AvatarImage src={thread.author?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                      {getAvatarFallback(thread.author?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <User className="w-4 h-4 text-slate-500" />
                      {getDisplayName(thread)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(thread.created_at)}
                    </p>
                  </div>
                </div>

                {/* Thread Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.views_count}</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.replies_count}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Thread Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {thread.content}
                  </p>
                </div>
              </div>

              {/* Thread Actions */}
              <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-slate-700/70 pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike('thread', thread.id)}
                    className={cn(
                      "transition-all duration-200 hover:scale-105",
                      thread.likes_count > 0 
                        ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/40 dark:hover:to-pink-900/40" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Heart className={cn(
                      "w-4 h-4 mr-1.5 transition-colors",
                      thread.likes_count > 0 ? "fill-current" : ""
                    )} />
                    {thread.likes_count}
                  </Button>
                </div>

                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Started a discussion
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Section */}
        {posts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
              </h2>
            </div>
            
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={post.id} className="relative">
                  {/* Connection Line */}
                  {index > 0 && (
                    <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600" />
                  )}
                  
                  <Card className="bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <Avatar className="w-11 h-11 ring-2 ring-slate-200/50 dark:ring-slate-700/50">
                            <AvatarImage src={
                              (post as any).author?.avatar_url || 
                              (post as PostFromAPI).author_avatar_url || 
                              undefined
                            } />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                              {getAvatarFallback(
                                (post as any).author?.username || 
                                (post as PostFromAPI).author_username
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {index < posts.length - 1 && (
                            <div className="w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600 mt-2" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Post Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {getDisplayName(post)}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(post.created_at)}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                              #{index + 1}
                            </Badge>
                          </div>

                          {/* Post Content */}
                          <div className="mb-4">
                            <div className="bg-slate-50/70 dark:bg-slate-800/30 rounded-lg p-4 border border-slate-200/30 dark:border-slate-700/30">
                              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          </div>

                          {/* Post Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike('post', post.id)}
                              className={cn(
                                "transition-all duration-200 hover:scale-105 rounded-full",
                                post.likes_count > 0 
                                  ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 text-rose-600 dark:text-rose-400 hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/40 dark:hover:to-pink-900/40" 
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                              )}
                            >
                              <Heart className={cn(
                                "w-4 h-4 mr-1.5",
                                post.likes_count > 0 ? "fill-current" : ""
                              )} />
                              {post.likes_count}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  openDialog({
                                    defaultTab: "signin",
                                    actionContext: "to reply to this post"
                                  });
                                } else {
                                  setReplyingTo(post.id);
                                }
                              }}
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
                            >
                              {isAuthenticated ? (
                                <>
                                  <Reply className="w-4 h-4 mr-1.5" />
                                  Reply
                                </>
                              ) : (
                                <>
                                  <LogIn className="w-4 h-4 mr-1.5" />
                                  Login to Reply
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === post.id && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/30 dark:border-blue-800/30 rounded-xl backdrop-blur-sm">
                              <div className="flex gap-3">
                                <Avatar className="w-9 h-9 ring-2 ring-blue-200/50 dark:ring-blue-700/50">
                                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                    {getAvatarFallback(user?.user_metadata?.username || user?.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                  <Textarea
                                    placeholder="Write your thoughtful reply..."
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-600"
                                    rows={3}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setNewPostContent("");
                                      }}
                                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleCreatePost(post.id)}
                                      disabled={!newPostContent.trim() || isSubmitting}
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                                    >
                                      <Send className="w-4 h-4 mr-1.5" />
                                      {isSubmitting ? "Sending..." : "Send Reply"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Post Form - Authentication Required */}
        {!thread.is_locked && replyingTo === null && (
          <Card className="bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Join the Discussion</h3>
              </div>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                        {getAvatarFallback(user?.user_metadata?.username || user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {user?.user_metadata?.username || user?.email}
                      </p>
                      <Textarea
                        placeholder="Share your thoughts on this topic..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px] border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleCreatePost()}
                      disabled={!newPostContent.trim() || isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <LogIn className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Ready to join the conversation?</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Sign in to share your thoughts and connect with the gaming community.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6"
                      size="lg"
                      onClick={() => openDialog({
                        defaultTab: "signin",
                        actionContext: "to post in this thread"
                      })}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-6"
                      onClick={() => openDialog({
                        defaultTab: "signup",
                        actionContext: "to post in this thread"
                      })}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Thread Locked State */}
        {thread.is_locked && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/60 dark:border-amber-800/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-2">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-200">This thread is locked</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    No new replies can be posted to this thread.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No replies yet</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              Be the first to share your thoughts and start the conversation!
            </p>
            {!thread.is_locked && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  textarea?.focus();
                  textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Reply className="w-4 h-4 mr-2" />
                Write First Reply
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Authentication Dialog */}
      <Dialog />
    </div>
  );
}