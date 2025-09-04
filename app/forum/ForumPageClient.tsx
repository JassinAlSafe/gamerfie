"use client";

import { useState } from "react";
import { ForumCategory, ForumStats } from "@/types/forum";
import { MessageSquare, Users } from "lucide-react";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { useRouter } from "next/navigation";

interface ForumPageClientProps {
  initialCategories: ForumCategory[];
  initialStats: ForumStats;
}

export function ForumPageClient({ initialCategories, initialStats }: ForumPageClientProps) {
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const { openDialog, Dialog: AuthDialog } = useAuthDialog();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const isAuthenticated = isInitialized && !!user;

  const filteredCategories = initialCategories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleNewThreadClick = () => {
    if (!isAuthenticated) {
      openDialog({
        defaultTab: "signin",
        actionContext: "to create a new thread"
      });
      return;
    }
    // TODO: Open thread creation dialog
    console.log("Create thread dialog - to be implemented");
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/forum/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header - Social Hub Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Community Forum</h1>
              <p className="text-gray-400 mt-1">
                Connect and discuss with fellow gamers • {initialStats?.total_threads || 0} threads
              </p>
            </div>
            <button
              onClick={handleNewThreadClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              New Thread
            </button>
          </div>

          {/* Stats Row - Minimal */}
          <div className="flex gap-8 mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-semibold text-white">{initialStats?.total_threads || 0}</span>
              <span className="text-sm text-gray-400">threads</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-semibold text-white">{initialStats?.total_users || 0}</span>
              <span className="text-sm text-gray-400">members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-lg font-semibold text-green-400">{initialStats?.active_users_today || 0}</span>
              <span className="text-sm text-gray-400">online</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories and discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">
              Discussion Categories
            </h2>
            <p className="text-gray-400 text-sm">
              Browse topics and join conversations
            </p>
          </div>

          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id, category.name)}
                className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4 hover:bg-gray-900/50 hover:border-gray-600/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{category.thread_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{category.post_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">
                  {searchQuery ? "No categories found" : "No categories available"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {searchQuery 
                    ? `No categories match "${searchQuery}". Try different terms.`
                    : "Categories will appear here once created."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Dialog */}
      <AuthDialog />
    </div>
  );
}