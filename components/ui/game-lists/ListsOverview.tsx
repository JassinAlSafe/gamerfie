"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/friends/StatCard";
import { ActionButton } from "@/components/ui/friends/ActionButton";
import { 
  BookOpen, 
  Plus, 
  TrendingUp,
  Calendar,
  Gamepad2,
  RefreshCw
} from "lucide-react";

export interface GameList {
  id: string;
  title: string;
  games: Array<{ id: string; name: string }>;
  updatedAt: string;
  createdAt?: string;
}

export interface ListsOverviewProps {
  lists: GameList[];
  onCreateList: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ListsOverview = memo<ListsOverviewProps>(function ListsOverview({
  lists,
  onCreateList,
  onRefresh,
  isLoading = false
}) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Game Lists</h1>
          <p className="text-gray-400 mt-1">
            Organize and track your gaming adventures
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {onRefresh && (
            <ActionButton
              onClick={onRefresh}
              variant="outline"
              color="default"
              icon={<RefreshCw />}
              loading={isLoading}
            >
              Refresh
            </ActionButton>
          )}
          
          <ActionButton
            onClick={onCreateList}
            color="purple"
            icon={<Plus />}
            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
          >
            Create List
          </ActionButton>
        </div>
      </div>

      {/* Stats Row */}
      {lists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <StatCard
              value={stats.totalLists}
              label="Total Lists"
              color="purple"
              size="md"
            />
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2">
              <Gamepad2 className="w-6 h-6 text-blue-400" />
            </div>
            <StatCard
              value={stats.totalGames}
              label="Total Games"
              color="blue"
              size="md"
            />
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <StatCard
              value={stats.uniqueGames}
              label="Unique Games"
              color="green"
              size="md"
            />
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-500/20 rounded-full mx-auto mb-2">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <StatCard
              value={stats.recentActivity}
              label="Recent Updates"
              color="amber"
              size="md"
            />
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      {lists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="font-medium text-white mb-1">Most Active</h3>
            <p className="text-sm text-gray-400">
              {lists.length > 0 
                ? `${lists.reduce((max, list) => 
                    (list.games?.length || 0) > (max.games?.length || 0) ? list : max, 
                    lists[0]
                  ).title} (${lists.reduce((max, list) => 
                    (list.games?.length || 0) > (max.games?.length || 0) ? list : max, 
                    lists[0]
                  ).games?.length || 0} games)`
                : "No lists yet"
              }
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-medium text-white mb-1">Latest Activity</h3>
            <p className="text-sm text-gray-400">
              {lists.length > 0 
                ? `${lists.sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  )[0]?.title || "Unknown"} updated`
                : "No recent activity"
              }
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-medium text-white mb-1">Collection Size</h3>
            <p className="text-sm text-gray-400">
              {stats.totalGames > 0 
                ? `${Math.round(stats.totalGames / stats.totalLists)} avg games per list`
                : "Start building your collection"
              }
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});