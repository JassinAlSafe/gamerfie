"use client";

import { useState } from "react";
import { ForumCategory, ForumThread } from "@/types/forum";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, MessageSquare, Eye, Pin, Lock, ArrowLeft, Clock, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CategoryPageClientProps {
  category: ForumCategory;
  initialThreads: ForumThread[];
}

export function CategoryPageClient({ category, initialThreads }: CategoryPageClientProps) {
  const router = useRouter();
  const [threads] = useState(initialThreads);
  const [searchQuery, setSearchQuery] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: category.id,
          title: newThreadTitle,
          content: newThreadContent,
        }),
      });

      if (response.ok) {
        // Reset form and close dialog
        setNewThreadTitle("");
        setNewThreadContent("");
        setIsCreateDialogOpen(false);
        // Refresh the page to show the new thread
        router.refresh();
      } else {
        console.error("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
    };
    return colors[color as keyof typeof colors] || "bg-gray-500";
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

  // Sort threads: pinned first, then by last post date
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_post_at || b.updated_at).getTime() - new Date(a.last_post_at || a.updated_at).getTime();
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="forum-skip-link">Skip to main content</a>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <main id="main-content" role="main">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className={`w-16 h-16 rounded-xl ${getCategoryColor(category.color || 'blue')} flex items-center justify-center text-3xl shadow-lg`}>
            {category.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 forum-stats">
          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{category.threads_count}</p>
                <p className="text-sm text-muted-foreground">Threads</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{category.posts_count}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border md:block hidden">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{threads.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 forum-actions">
          <div className="relative flex-1 max-w-md forum-search">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
              aria-label="Search threads in this category"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" aria-label={`Create new thread in ${category.name}`}>
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border max-w-2xl forum-dialog">
              <DialogHeader>
                <DialogTitle>Create New Thread in {category.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Thread Title</Label>
                  <Input
                    id="title"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Enter thread title..."
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Write your post content..."
                    rows={8}
                    className="bg-card border-border"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-border text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateThread}
                    disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Create Thread
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {sortedThreads.map((thread) => (
            <Link key={thread.id} href={`/forum/thread/${thread.id}`} aria-label={`Read thread: ${thread.title}`}>
              <Card className="bg-card border-border hover:bg-accent/5 transition-colors cursor-pointer forum-thread-item">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.is_pinned && (
                          <Pin className="w-4 h-4 text-green-500" />
                        )}
                        {thread.is_locked && (
                          <Lock className="w-4 h-4 text-red-500" />
                        )}
                        <h3 className="font-semibold text-foreground hover:text-purple-400 transition-colors">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                        <span className="flex items-center gap-1">
                          <span className="text-purple-400">{thread.author?.username}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(thread.created_at)}
                        </span>
                        {thread.last_post_at && thread.last_post_at !== thread.created_at && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Last: {formatTimeAgo(thread.last_post_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {thread.replies_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {thread.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {thread.likes_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {sortedThreads.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchQuery ? "No threads found" : "No threads yet"}
            </h3>
            <p className="text-muted-foreground/70 mb-4">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Be the first to start a discussion in this category!"
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Thread
              </Button>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}