"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useFriendsStore } from "@/stores/useFriendsStore";
import { ActivityType, FriendActivity } from "@/types/friend";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Trophy, MessageSquare, Filter, RefreshCw } from "lucide-react";

const groupActivitiesByDate = (activities: FriendActivity[]) => {
  return activities.reduce(
    (groups: Record<string, FriendActivity[]>, activity) => {
      let dateToUse: Date;
      try {
        // Try using created_at first, then fall back to timestamp
        const dateString = activity.created_at || activity.timestamp;
        dateToUse = new Date(dateString);

        // Check if the date is valid
        if (isNaN(dateToUse.getTime())) {
          // Try parsing as Unix timestamp (milliseconds)
          if (typeof dateString === "number") {
            dateToUse = new Date(dateString);
          }

          // If still invalid, use current date
          if (isNaN(dateToUse.getTime())) {
            dateToUse = new Date();
          }
        }
      } catch {
        dateToUse = new Date();
      }

      const date = format(dateToUse, "MMMM d, yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    },
    {}
  );
};

export const FriendActivityFeed = React.memo(() => {
  const {
    activities,
    isLoadingActivities,
    loadMoreActivities,
    fetchActivities,
    error,
  } = useFriendsStore();
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchActivities();
    } catch {
      // Error handling is done in the store
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities().catch(() => {
      // Error handling is done in the store
    });
  }, [fetchActivities]);

  // Debounced polling to prevent excessive API calls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let debounceTimeout: NodeJS.Timeout;

    const debouncedFetch = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        fetchActivities().catch(() => {
          // Error handling is done in the store
        });
      }, 1000);
    };

    const startPolling = () => {
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          debouncedFetch();
        }
      }, 60000); // Poll every 60 seconds (reduced frequency)
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        debouncedFetch();
        startPolling();
      } else {
        clearInterval(interval);
        clearTimeout(debounceTimeout);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(interval);
      clearTimeout(debounceTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchActivities]);

  // Remove debug logging for production

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    return Object.entries(
      groupActivitiesByDate(filteredActivities)
    ).map(([date, activities]) => ({
      date,
      activities,
    }));
  }, [filteredActivities]);

  // Enhanced loading state with skeleton
  if (isLoadingActivities && !activities.length) {
    return (
      <div className="space-y-8">
        {/* Filter skeleton */}
        <div className="flex flex-wrap gap-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
        
        {/* Activity skeleton */}
        <div className="space-y-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-px bg-gray-800 flex-1"></div>
              </div>
              <div className="space-y-4">
                {Array(2).fill(0).map((_, j) => (
                  <div key={j} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-900/10 border border-red-800/30 rounded-xl"
      >
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-3 border border-red-500/20">
            <Users className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Unable to Load Activities</h3>
        <p className="text-red-400 mb-6 max-w-md">{error}</p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300"
        >
          {isRefreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with filters and refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">Filter Activities</span>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700"
        >
          {isRefreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "started_playing" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("started_playing")}
        >
          Started Playing
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "achievement" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("achievement")}
        >
          Achievements
        </Button>
        <Button
          variant={filter === "review" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("review")}
        >
          Reviews
        </Button>
      </div>

      {filteredActivities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-4 border border-blue-500/20">
              {filter === "all" ? (
                <Calendar className="w-12 h-12 text-blue-400" />
              ) : filter === "achievement" ? (
                <Trophy className="w-12 h-12 text-yellow-400" />
              ) : (
                <MessageSquare className="w-12 h-12 text-green-400" />
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === "all" ? "No Activities Yet" : `No ${filter.replace('_', ' ')} Activities`}
          </h3>
          <p className="text-gray-400 max-w-md">
            {filter === "all" 
              ? "Start playing games and connecting with friends to see activities here!"
              : `No ${filter.replace('_', ' ')} activities found. Try a different filter or check back later.`
            }
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {groupedActivities.map(({ date, activities }) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-medium text-gray-300">{date}</h3>
                  </div>
                  <Separator className="flex-1" />
                  <span className="text-xs text-gray-500">
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ActivityCard activity={activity} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filteredActivities.length > 0 && (
        <div className="text-center pt-4">
          <Button
            onClick={() => loadMoreActivities()}
            variant="outline"
            disabled={isLoadingActivities}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            {isLoadingActivities ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Load More Activities"
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

FriendActivityFeed.displayName = 'FriendActivityFeed';
