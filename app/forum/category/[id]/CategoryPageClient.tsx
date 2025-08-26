"use client";

import { useState } from "react";
import { ForumCategory, ForumThread } from "@/types/forum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MessageSquare, Eye, Pin, Lock, ArrowLeft, Clock, ThumbsUp, User, TrendingUp, Activity, Sparkles, Users, Hash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthDialog } from "@/components/auth/AuthDialog";

interface CategoryPageClientProps {
  category: ForumCategory;
  initialThreads: ForumThread[];
}

export function CategoryPageClient({ category, initialThreads }: CategoryPageClientProps) {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const [threads] = useState(initialThreads);
  const [searchQuery, setSearchQuery] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isAuthenticated = isInitialized && !!user;

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewThreadClick = () => {
    if (!isAuthenticated) {
      openDialog({
        defaultTab: "signin",
        actionContext: "to create a new thread"
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

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

  const getAvatarFallback = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground">
      <a href="#main-content" className="forum-skip-link">Skip to main content</a>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <main id="main-content" role="main">

        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Back to Categories
          </Button>
        </div>

        {/* Category Hero Section */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-6">
                {/* Category Icon - Prominent Display */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl ${getCategoryColor(category.color || 'blue')} flex items-center justify-center text-4xl shadow-lg ring-4 ring-white/50 dark:ring-slate-800/50`}>
                    {category.icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {category.name}
                    </h1>
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/50">
                      <Hash className="w-3 h-3 mr-1" />
                      Category
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-2xl">
                      {category.description}
                    </p>
                  )}

                  {/* Enhanced Stats Row */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{category.threads_count} Threads</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{category.posts_count} Posts</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{threads.length} Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="mb-8">
          <Card className="bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Enhanced Search */}
                <div className="relative flex-1 max-w-xl">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <Input
                    placeholder="Search threads in this category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 text-base"
                    aria-label="Search threads in this category"
                  />
                  {searchQuery && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="text-xs">
                        {filteredThreads.length} results
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Enhanced New Thread Button */}
                <Button 
                  onClick={handleNewThreadClick}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6 py-3 text-base font-semibold transition-all duration-200 hover:scale-105" 
                  aria-label={`Create new thread in ${category.name}`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Thread
                </Button>
              </div>

              {/* Quick Stats Summary */}
              {searchQuery && (
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Found {filteredThreads.length} thread{filteredThreads.length !== 1 ? 's' : ''} matching "{searchQuery}"
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Threads Section Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {searchQuery ? 'Search Results' : 'Recent Discussions'}
              </h2>
              {!searchQuery && sortedThreads.length > 0 && (
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {sortedThreads.length} threads
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Threads List */}
        <div className="space-y-4">
          {sortedThreads.map((thread, index) => (
            <Link key={thread.id} href={`/forum/thread/${thread.id}`} aria-label={`Read thread: ${thread.title}`}>
              <Card className="bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Thread Author Avatar */}
                    <div className="flex flex-col items-center">
                      <Avatar className="w-12 h-12 ring-2 ring-slate-200/50 dark:ring-slate-700/50">
                        <AvatarImage src={thread.author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                          {getAvatarFallback(thread.author?.username)}
                        </AvatarFallback>
                      </Avatar>
                      {index < sortedThreads.length - 1 && (
                        <div className="w-0.5 h-4 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600 mt-2" />
                      )}
                    </div>

                    {/* Thread Content */}
                    <div className="flex-1 min-w-0">
                      {/* Thread Status & Title */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight mb-2">
                            {thread.title}
                          </h3>
                          
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {thread.content}
                          </p>
                        </div>

                        {/* Thread Stats */}
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.replies_count}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.views_count}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                              <ThumbsUp className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{thread.likes_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Thread Meta Information */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium text-purple-600 dark:text-purple-400">{thread.author?.username}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(thread.created_at)}
                          </span>
                        </div>

                        {thread.last_post_at && thread.last_post_at !== thread.created_at && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Activity className="w-3 h-3" />
                            <span>Last reply {formatTimeAgo(thread.last_post_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Create Thread Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm max-w-3xl">
            <DialogHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${getCategoryColor(category.color || 'blue')} flex items-center justify-center text-xl shadow-lg`}>
                  {category.icon}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Create New Thread
                  </DialogTitle>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Start a new discussion in {category.name}</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 block">
                  Thread Title
                </Label>
                <Input
                  id="title"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your thread..."
                  className="bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 text-base py-3"
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 block">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  rows={8}
                  className="bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 dark:focus:border-purple-600 resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateThread}
                  disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Thread
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Empty State */}
        {sortedThreads.length === 0 && (
          <Card className="bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <CardContent className="py-16 px-8">
              <div className="text-center max-w-md mx-auto">
                {/* Empty State Icon */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                  <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                </div>

                {/* Empty State Content */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {searchQuery ? "No threads found" : "No discussions yet"}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  {searchQuery 
                    ? `No threads match "${searchQuery}". Try adjusting your search terms or browse all threads.`
                    : `${category.name} is ready for its first discussion! Share your thoughts, ask questions, or start a conversation with the community.`
                  }
                </p>

                {/* Empty State Actions */}
                <div className="space-y-3">
                  {!searchQuery && (
                    <Button
                      onClick={handleNewThreadClick}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-8 py-3 font-semibold text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start First Discussion
                    </Button>
                  )}
                  
                  {searchQuery && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                        size="lg"
                        className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-6"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Clear Search
                      </Button>
                      <Button
                        onClick={handleNewThreadClick}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Thread
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </main>
      </div>

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}