"use client";

import { useState } from "react";
import { ForumThread, ForumPost } from "@/types/forum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Eye, ThumbsUp, Pin, Lock, Send, Reply, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </div>

        {/* Thread Header */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {thread.is_pinned && (
                    <Pin className="w-4 h-4 text-green-500" />
                  )}
                  {thread.is_locked && (
                    <Lock className="w-4 h-4 text-red-500" />
                  )}
                  <h1 className="text-2xl font-bold text-foreground">
                    {thread.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={thread.author?.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {getAvatarFallback(thread.author?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{getDisplayName(thread)}</span>
                  </div>
                  <span>{formatTimeAgo(thread.created_at)}</span>
                  {thread.category && (
                    <Link href={`/forum/category/${thread.category_id}`}>
                      <Badge variant="secondary" className="hover:bg-accent">
                        {thread.category.icon} {thread.category.name}
                      </Badge>
                    </Link>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {thread.content}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {thread.views_count} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {thread.replies_count} replies
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike('thread', thread.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {thread.likes_count}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={
                      (post as any).author?.avatar_url || 
                      (post as PostFromAPI).author_avatar_url || 
                      undefined
                    } />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {getAvatarFallback(
                        (post as any).author?.username || 
                        (post as PostFromAPI).author_username
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {getDisplayName(post)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none mb-4">
                      <p className="text-foreground whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike('post', post.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {post.likes_count}
                      </Button>

                      {isAuthenticated ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(post.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      ) : (
                        <Link href="/signin">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <LogIn className="w-4 h-4 mr-1" />
                            Login to Reply
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === post.id && (
                      <div className="mt-4 p-4 bg-accent/5 border border-border rounded-lg">
                        <div className="flex gap-4">
                          <Textarea
                            placeholder="Write your reply..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="flex-1"
                            rows={3}
                          />
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleCreatePost(post.id)}
                              disabled={!newPostContent.trim() || isSubmitting}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setNewPostContent("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Post Form - Authentication Required */}
        {!thread.is_locked && replyingTo === null && (
          <Card className="bg-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold">Post a Reply</h3>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <div className="flex gap-4">
                  <Textarea
                    placeholder="Write your reply..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1"
                    rows={4}
                  />
                  <div className="flex flex-col justify-end">
                    <Button
                      onClick={() => handleCreatePost()}
                      disabled={!newPostContent.trim() || isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">Login Required</h4>
                  <p className="text-muted-foreground mb-4">
                    You need to be logged in to post replies to this thread.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/signin">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" className="border-border">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {thread.is_locked && (
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <Lock className="w-4 h-4" />
                <span className="font-medium">This thread is locked</span>
              </div>
              <p className="text-sm text-yellow-600/80 mt-1">
                No new replies can be posted to this thread.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No replies yet</h3>
            <p className="text-muted-foreground">Be the first to reply to this thread!</p>
          </div>
        )}
      </div>
    </div>
  );
}