"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJournalStore } from "@/stores/useJournalStore";
import { JournalEntryDialog } from "../journal/JournalEntryDialog";
import { GameListCard, EmptyState } from "@/components/ui/game-lists";
import { ActionButton } from "@/components/ui/friends/ActionButton";
import { StatCard } from "@/components/ui/friends/StatCard";
import { GameListItem } from "@/types/gamelist/game-list";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  BookOpen, 
  Plus, 
  TrendingUp,
  Calendar,
  Gamepad2,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

// Enhanced game list interface
interface EnhancedGameList {
  id: string;
  title: string;
  content: string | null;
  games: GameListItem[];
  updatedAt: string;
  createdAt: string;
  type: "list";
}

export default function GameListsClient() {
  const { entries, isLoading, error, fetchEntries } = useJournalStore();
  const router = useRouter();
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // Optimized data transformation using useMemo
  const lists = useMemo((): EnhancedGameList[] => {
    return entries
      .filter((entry) => entry.type === "list")
      .map((entry) => {
        let games: GameListItem[] = [];
        if (entry.content) {
          try {
            if (entry.content.startsWith("[")) {
              games = JSON.parse(entry.content);
            }
          } catch (error) {
            console.error("Error parsing games from list", error);
          }
        }
        return {
          id: entry.id,
          title: entry.title,
          content: entry.content,
          games,
          updatedAt: entry.updatedAt || entry.date,
          createdAt: entry.date,
          type: "list" as const,
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [entries]);

  // Optimized handlers using useCallback
  const handleCreateList = useCallback(() => {
    setIsNewEntryModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsNewEntryModalOpen(false);
  }, []);

  const handleListClick = useCallback((listId: string) => {
    router.push(`/profile/lists/${listId}`);
  }, [router]);

  const handleRefresh = useCallback(async () => {
    try {
      await fetchEntries();
      toast.success("Lists refreshed!");
    } catch (error) {
      toast.error("Failed to refresh lists");
    }
  }, [fetchEntries]);

  // Calculate stats for display
  const stats = useMemo(() => {
    const totalLists = lists.length;
    const totalGames = lists.reduce((acc, list) => acc + (list.games?.length || 0), 0);
    const uniqueGames = new Set(
      lists.flatMap(list => list.games?.map(game => game.id) || [])
    ).size;
    
    // Recent activity (lists updated in last 7 days)
    const recentActivity = lists.filter(list => {
      const updated = new Date(list.updatedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return updated > weekAgo;
    }).length;

    return {
      totalLists,
      totalGames,
      uniqueGames,
      recentActivity
    };
  }, [lists]);

  // Initialize data
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/15 border border-red-500/25 rounded-2xl mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-400 mb-3">Failed to Load Lists</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
            <ActionButton
              onClick={handleRefresh}
              variant="default"
              size="md"
              icon={<RefreshCw className="w-4 h-4" />}
              className="bg-red-600 hover:bg-red-500 text-white border-red-500/50 hover:border-red-400/70 shadow-lg hover:shadow-red-500/25 transition-all duration-200"
            >
              Try Again
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header - Enhanced Layout */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Game Lists
              <span className="ml-4 text-lg sm:text-xl font-medium text-gray-400">
                {lists.length} {lists.length === 1 ? "list" : "lists"}
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              Organize and manage your gaming collections with custom lists
            </p>
          </div>
          
          <div className="flex items-center gap-3 sm:flex-shrink-0">
            <ActionButton
              onClick={handleRefresh}
              variant="outline"
              size="md"
              color="default"
              icon={<RefreshCw className="w-4 h-4" />}
              loading={isLoading}
              className="bg-gray-800/40 hover:bg-gray-700/60 border-gray-600/50 hover:border-gray-500/70 text-gray-300 hover:text-white transition-all duration-200"
            >
              Refresh
            </ActionButton>
            
            <ActionButton
              onClick={handleCreateList}
              variant="default"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-500 text-white border-purple-500/50 hover:border-purple-400/70 shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Create List
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Stats Overview - Enhanced with Better Spacing */}
      {lists.length > 0 && (
        <div className="bg-gray-900/20 border border-gray-800/50 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">Overview</h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 bg-purple-500/15 border border-purple-500/25 rounded-2xl mx-auto shadow-sm">
                <BookOpen className="w-7 h-7 text-purple-400" />
              </div>
              <StatCard
                value={stats.totalLists}
                label="Total Lists"
                color="purple"
                size="sm"
              />
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 bg-blue-500/15 border border-blue-500/25 rounded-2xl mx-auto shadow-sm">
                <Gamepad2 className="w-7 h-7 text-blue-400" />
              </div>
              <StatCard
                value={stats.totalGames}
                label="Total Games"
                color="blue"
                size="sm"
              />
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 bg-green-500/15 border border-green-500/25 rounded-2xl mx-auto shadow-sm">
                <TrendingUp className="w-7 h-7 text-green-400" />
              </div>
              <StatCard
                value={stats.uniqueGames}
                label="Unique Games"
                color="green"
                size="sm"
              />
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 bg-amber-500/15 border border-amber-500/25 rounded-2xl mx-auto shadow-sm">
                <Calendar className="w-7 h-7 text-amber-400" />
              </div>
              <StatCard
                value={stats.recentActivity}
                label="Recent Updates"
                color="amber"
                size="sm"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-8">
        {lists.length === 0 ? (
          <div className="py-8">
            <EmptyState onCreateList={handleCreateList} variant="compact" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <h2 className="text-xl font-semibold text-white">Your Collections</h2>
              </div>
              <p className="text-gray-400 text-sm">
                {lists.reduce((acc, list) => acc + list.games.length, 0)} games across {lists.length} lists
              </p>
            </div>

            {/* Lists Grid - Enhanced Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {lists.map((list, index) => (
                <GameListCard
                  key={list.id}
                  id={list.id}
                  title={list.title}
                  content={list.content}
                  games={list.games}
                  updatedAt={list.updatedAt}
                  onClick={handleListClick}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination/Load More Section - Future Enhancement */}
            {lists.length > 12 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-8 border-t border-gray-800/30"
              >
                <ActionButton
                  onClick={() => {}} // Future: Load more functionality
                  variant="outline"
                  size="md"
                  className="bg-gray-800/40 hover:bg-gray-700/60 border-gray-600/50 hover:border-gray-500/70"
                >
                  Load More Lists
                </ActionButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create List Modal */}
      <JournalEntryDialog
        isOpen={isNewEntryModalOpen}
        onClose={handleCloseModal}
        initialType="list"
      />
    </div>
  );
}
