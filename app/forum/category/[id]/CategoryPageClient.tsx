"use client";

import { useState } from "react";
import { ForumCategory, ForumThread, ThreadsWithDetailsResult } from "@/types/forum";
import { ArrowLeft, MessageSquare, Users, Plus, Eye, Heart, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { CreateThreadDialog } from "@/components/forum/CreateThreadDialog";
import { useCsrfProtectedFetch } from "@/hooks/use-csrf-token";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface CategoryPageClientProps {
  category: ForumCategory;
  initialThreads: ThreadsWithDetailsResult[];
}

export function CategoryPageClient({ category, initialThreads }: CategoryPageClientProps) {
  const router = useRouter();
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const { fetchWithCsrf, isReady } = useCsrfProtectedFetch();
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
    if (!isReady) {
      toast.error("Please wait for security initialization...");
      return;
    }

    setIsCreatingThread(true);
    
    try {
      const response = await fetchWithCsrf("/api/forum/threads", {
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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create thread");
      }

      const result = await response.json();
      
      // Close dialog and show success
      setIsCreateDialogOpen(false);
      toast.success("Thread created successfully!");
      
      // Navigate to the new thread
      if (result.thread?.id) {
        router.push(`/forum/thread/${result.thread.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create thread");
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/forum/thread/${threadId}`);
  };

  // Sort threads: pinned first, then by last activity
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_post_at || b.updated_at).getTime() - 
           new Date(a.last_post_at || a.updated_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <button
          onClick={() => router.push("/forum")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </button>

        {/* Category Header - Minimal Style */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{category.icon || "💬"}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{category.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Category</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mt-2">
                {category.description}
              </p>
              
              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-white font-semibold">{category.threads_count || 0}</span>
                  <span className="text-sm text-gray-400">Threads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-white font-semibold">{category.posts_count || 0}</span>
                  <span className="text-sm text-gray-400">Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold">{threads.length}</span>
                  <span className="text-sm text-gray-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={`Search threads in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleNewThreadClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              aria-label={`Create new thread in ${category.name}`}
            >
              <Plus className="w-4 h-4" />
              New Thread
            </button>
          </div>
        </div>

        {/* Threads Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-white">
              {searchQuery ? 'Search Results' : 'Recent Discussions'}
            </h2>
            {sortedThreads.length > 0 && (
              <span className="text-sm text-gray-400">
                {sortedThreads.length} {sortedThreads.length === 1 ? 'thread' : 'threads'}
              </span>
            )}
          </div>

          {/* Threads List */}
          <div className="space-y-3">
            {sortedThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleThreadClick(thread.id)}
                className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-900/50 hover:border-gray-600/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-sm font-bold">
                      {thread.author_username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Thread content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {thread.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {thread.content}
                        </p>
                      </div>
                      {thread.is_pinned && (
                        <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Thread stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{thread.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{thread.replies_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{thread.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>
                          {thread.created_at ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedThreads.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">
                  {searchQuery ? "No threads found" : "No discussions yet"}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {searchQuery 
                    ? `No threads match "${searchQuery}". Try different search terms.`
                    : `${category.name} is ready for its first discussion! Share your thoughts, ask questions, or start a conversation with the community.`
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleNewThreadClick}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Start First Discussion
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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