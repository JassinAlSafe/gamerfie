"use client";

import { useState } from "react";
import { ForumCategory, ForumThread } from "@/types/forum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, TrendingUp, Users, Hash, Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { ForumSearchBar } from "@/components/forum/ForumSearchBar";
import { ForumThreadCard } from "@/components/forum/ForumThreadCard";
import { CreateThreadDialog } from "@/components/forum/CreateThreadDialog";
import { cn } from "@/lib/utils";

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

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

  const handleCreateThread = async (data: { title: string; content: string; categoryId: string }) => {
    setIsCreatingThread(true);
    
    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: data.categoryId,
          title: data.title,
          content: data.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create thread");
      }

      // Refresh the page to show the new thread
      router.refresh();
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    } finally {
      setIsCreatingThread(false);
    }
  };

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
    };
    return colors[color as keyof typeof colors] || "from-slate-500 to-slate-600";
  };

  // Sort threads: pinned first, then by last post date
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_post_at || b.updated_at).getTime() - new Date(a.last_post_at || a.updated_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-3 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
      <div className="container mx-auto px-4 pt-20 pb-6 max-w-6xl">
        <main id="main-content" role="main">
          {/* Enhanced Navigation */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Forum
            </Button>
          </div>

          {/* Enhanced Category Hero Section */}
          <div className="mb-8">
            <Card className="bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start gap-6">
                  {/* Category Icon - Prominent Display */}
                  <div className="relative">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl shadow-lg ring-4 ring-white/50 dark:ring-slate-800/50 transition-all duration-300",
                      getCategoryColor(category.color || 'blue')
                    )}>
                      <span className="text-white">{category.icon}</span>
                    </div>
                    {category.posts_count > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
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

          {/* Enhanced Actions Bar */}
          <div className="mb-8">
            <Card className="bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Enhanced Search */}
                  <ForumSearchBar
                    placeholder={`Search threads in ${category.name}...`}
                    value={searchQuery}
                    onChange={setSearchQuery}
                    resultsCount={filteredThreads.length}
                    className="flex-1 max-w-xl"
                  />

                  {/* Enhanced New Thread Button */}
                  <Button 
                    onClick={handleNewThreadClick}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 px-6 py-3 text-base font-semibold transition-all duration-200 hover:scale-105 whitespace-nowrap" 
                    aria-label={`Create new thread in ${category.name}`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Thread
                  </Button>
                </div>
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
              <ForumThreadCard
                key={thread.id}
                thread={thread}
                showTimeline={true}
                isLast={index === sortedThreads.length - 1}
              />
            ))}
          </div>

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

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        categories={[category]}
        selectedCategoryId={category.id}
        onSubmit={handleCreateThread}
        isLoading={isCreatingThread}
      />

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}