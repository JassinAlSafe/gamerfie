"use client";

import { useState } from "react";
import { ForumCategory, ForumStats } from "@/types/forum";
import { MessageSquare, Users, TrendingUp, Activity } from "lucide-react";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { useCsrfProtectedFetch } from "@/hooks/use-csrf-token";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { ForumStatsCard } from "@/components/forum/ForumStatsCard";
import { ForumSearchBar } from "@/components/forum/ForumSearchBar";
import { ForumCategoryCard } from "@/components/forum/ForumCategoryCard";
import { CreateThreadDialog } from "@/components/forum/CreateThreadDialog";

interface ForumPageClientProps {
  initialCategories: ForumCategory[];
  initialStats: ForumStats;
}

export function ForumPageClient({ initialCategories, initialStats }: ForumPageClientProps) {
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const { fetchWithCsrf, isReady } = useCsrfProtectedFetch();
  const [categories] = useState(initialCategories);
  const [stats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const isAuthenticated = isInitialized && !!user;

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
      throw new Error("CSRF token not ready. Please try again.");
    }

    setIsCreatingThread(true);
    
    try {
      const response = await fetchWithCsrf("/api/forum/threads", {
        method: "POST",
        body: JSON.stringify({
          category_id: data.categoryId,
          title: data.title,
          content: data.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create thread");
      }

      // Refresh the page to show the new thread
      window.location.reload();
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    } finally {
      setIsCreatingThread(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-3 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <main id="main-content" role="main">
          {/* Enhanced Header */}
          <ForumHeader
            title="Community Forum"
            description="Connect with fellow gamers, share experiences, and get help from our vibrant gaming community"
            icon={<MessageSquare />}
            totalCount={stats.total_threads}
            onCreateClick={handleNewThreadClick}
            createButtonText="New Thread"
          />

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ForumStatsCard
              icon={<MessageSquare />}
              value={stats.total_threads}
              label="Threads"
              iconColor="text-blue-500"
            />
            <ForumStatsCard
              icon={<Activity />}
              value={stats.total_posts}
              label="Posts"
              iconColor="text-green-500"
            />
            <ForumStatsCard
              icon={<Users />}
              value={stats.total_users}
              label="Members"
              iconColor="text-purple-500"
            />
            <ForumStatsCard
              icon={<TrendingUp />}
              value={stats.active_users_today}
              label="Online Today"
              iconColor="text-orange-500"
            />
          </div>

          {/* Enhanced Search */}
          <ForumSearchBar
            placeholder="Search categories and discussions..."
            value={searchQuery}
            onChange={setSearchQuery}
            resultsCount={filteredCategories.length}
            className="mb-8"
          />

          {/* Categories Grid */}
          <div className="space-y-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Discussion Categories
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Browse topics and join conversations that interest you
              </p>
            </div>

            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <ForumCategoryCard
                  key={category.id}
                  category={category}
                  showActivity={true}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {searchQuery ? "No categories found" : "No categories available"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                {searchQuery 
                  ? `No categories match "${searchQuery}". Try adjusting your search terms.`
                  : "Forum categories will appear here once they're created by administrators."
                }
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        categories={categories}
        onSubmit={handleCreateThread}
        isLoading={isCreatingThread}
      />

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}