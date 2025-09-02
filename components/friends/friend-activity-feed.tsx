"use client";

import React, { useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useProfileActivities } from "@/hooks/Profile/use-profile-activities";
import { ActivityType, FriendActivity } from "@/types/friend";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { ProfileCardModal } from "@/components/profile/ProfileCardModal";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Trophy, MessageSquare, Filter, RefreshCw, Plus, Search, X } from "lucide-react";

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
  const router = useRouter();
  const {
    activities,
    isLoading,
    error,
    refetch,
    addReaction,
    addComment,
    deleteComment,
  } = useProfileActivities(50); // Show more activities on dedicated page
  
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [isChangingFilter, setIsChangingFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    refetch();
  }, [refetch]);

  const handleFilterChange = useCallback(async (newFilter: ActivityType | "all") => {
    if (newFilter !== filter) {
      setIsChangingFilter(true);
      setFilter(newFilter);
      // Simulate filter processing time for smooth UX
      setTimeout(() => {
        setIsChangingFilter(false);
      }, 300);
    }
  }, [filter]);

  const handleBrowseGames = useCallback(() => {
    router.push('/all-games');
  }, [router]);

  const handleFindFriends = useCallback(() => {
    router.push('/profile/friends');
  }, [router]);

  const handleCreateActivity = useCallback(() => {
    // For now, just show alert - could open modal or navigate to create page
    alert('Create Activity feature coming soon! 🎮');
  }, []);

  const handleToggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery(""); // Clear search when hiding
    }
  }, [showSearch, searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsPulling(false);
    setPullDistance(0);
    // Store initial touch position
    (e.currentTarget as any).initialY = touch.clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as any;
    const initialY = element.initialY || touch.clientY;
    
    // Only activate pull-to-refresh if scrolled to top
    if (element.scrollTop === 0) {
      const currentY = touch.clientY;
      const distance = Math.max(0, (currentY - initialY) * 0.5); // Reduce sensitivity
      
      if (distance > 10) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 80)); // Cap at 80px
        setIsPulling(distance > 60); // Trigger at 60px
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullDistance > 60) {
      await handleRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, handleRefresh]);

  // Profile modal handlers
  const handleOpenProfile = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalOpen(false);
    setSelectedUserId(null);
  }, []);

  const handleFollowUser = useCallback((userId: string) => {
    // TODO: Implement follow functionality
    console.log('Following user:', userId);
  }, []);

  const handleUnfollowUser = useCallback((userId: string) => {
    // TODO: Implement unfollow functionality
    console.log('Unfollowing user:', userId);
  }, []);

  const handleMessageUser = useCallback((userId: string) => {
    // TODO: Implement messaging functionality
    console.log('Messaging user:', userId);
    // Could navigate to messages page or open chat modal
    router.push(`/messages?userId=${userId}`);
  }, [router]);

  const handleShareProfile = useCallback((userId: string, shareType: 'link' | 'twitter' | 'discord' | 'qr') => {
    // TODO: Implement profile sharing functionality
    console.log('Sharing profile:', userId, 'via', shareType);
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter((activity) => activity.type === filter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((activity) => 
        activity.game?.name?.toLowerCase().includes(query) ||
        activity.user?.username?.toLowerCase().includes(query) ||
        activity.details?.comment?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activities, filter, searchQuery]);

  const groupedActivities = useMemo(() => {
    return Object.entries(
      groupActivitiesByDate(filteredActivities)
    ).map(([date, activities]) => ({
      date,
      activities,
    }));
  }, [filteredActivities]);

  // Enhanced loading state with improved skeleton
  if (isLoading && !activities.length) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Filter section skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array(5).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="h-8 bg-gray-700/60 rounded-lg animate-pulse"
                style={{ width: `${60 + Math.random() * 40}px` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Activity skeleton - Better matching actual layout */}
        <div className="space-y-6 sm:space-y-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-3 sm:space-y-4">
              {/* Date header skeleton */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-px bg-gray-700/50 flex-1"></div>
                <div className="h-5 w-16 bg-gray-700/50 rounded-full animate-pulse"></div>
              </div>
              
              {/* Activity cards skeleton */}
              <div className="space-y-3 sm:space-y-4">
                {Array(2).fill(0).map((_, j) => (
                  <div key={j} className="bg-gray-800/30 rounded-xl border border-gray-700/40 overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="h-3 w-24 bg-gray-800 rounded animate-pulse"></div>
                            <div className="h-5 w-16 bg-gray-700 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons skeleton */}
                    <div className="border-t border-gray-700/40 p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <div className="h-6 w-12 bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-6 w-6 bg-gray-700 rounded animate-pulse"></div>
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
        <p className="text-red-400 mb-6 max-w-md">{error?.message || 'An error occurred'}</p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isLoading}
          className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 hover:text-red-300"
        >
          {isLoading ? (
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
    <div 
      className="space-y-6 sm:space-y-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 ${
              isPulling 
                ? "bg-purple-500/20 border-2 border-purple-500/40" 
                : "bg-gray-800/60 border-2 border-gray-600/40"
            }`}
          >
            <RefreshCw 
              className={`w-5 h-5 transition-all duration-200 ${
                isPulling 
                  ? "text-purple-400 animate-spin" 
                  : "text-gray-400"
              }`} 
              style={{
                transform: `rotate(${pullDistance * 4}deg)`
              }}
            />
          </motion.div>
        </div>
      )}
      {/* Header with filters and refresh - Improved responsive layout */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Filter Activities</span>
            {filter !== "all" && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span className="text-xs text-purple-400 capitalize">{filter.replace('_', ' ')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleSearch}
              variant="outline"
              size="sm"
              className={`transition-all duration-200 ${
                showSearch 
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30" 
                  : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/80 text-gray-300 hover:text-white"
              }`}
            >
              {showSearch ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              onClick={handleCreateActivity}
              variant="outline"
              size="sm"
              className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Share Update
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Search Input - Appears when search is toggled */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by game, user, or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-gray-800/50 border-gray-700 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Improved filter pills with better mobile layout */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {[
            { key: "all", label: "All", icon: "🏠" },
            { key: "started_playing", label: "Started Playing", icon: "🎮" },
            { key: "completed", label: "Completed", icon: "✅" },
            { key: "achievement", label: "Achievements", icon: "🏆" },
            { key: "review", label: "Reviews", icon: "⭐" }
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(key as ActivityType | "all")}
              disabled={isChangingFilter}
              className={`
                text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-200
                ${filter === key 
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30" 
                  : "bg-gray-800/40 border-gray-700/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300 hover:border-gray-600"
                }
              `}
            >
              <span className="mr-1.5">{icon}</span>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center bg-gray-800/20 rounded-xl border border-gray-700/30"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-full p-3 sm:p-4 border border-purple-500/30">
              {filter === "all" ? (
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
              ) : filter === "achievement" ? (
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
              ) : (
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />
              )}
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {searchQuery 
              ? "No Search Results" 
              : filter === "all" 
                ? "No Activities Yet" 
                : `No ${filter.replace('_', ' ')} Activities`
            }
          </h3>
          <p className="text-gray-400 text-sm sm:text-base max-w-sm sm:max-w-md leading-relaxed">
            {searchQuery 
              ? `No activities found matching "${searchQuery}". Try a different search term or clear the search.`
              : filter === "all" 
                ? "Start playing games and connecting with friends to see activities here!"
                : `No ${filter.replace('_', ' ')} activities found. Try a different filter or check back later.`
            }
          </p>
          {filter === "all" && (
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all duration-200"
                onClick={handleBrowseGames}
              >
                🎮 Browse Games
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                onClick={handleFindFriends}
              >
                👥 Find Friends
              </Button>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="relative">
          {/* Filter Loading Overlay */}
          {isChangingFilter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
            >
              <div className="flex items-center gap-3 text-purple-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Filtering activities...</span>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 sm:space-y-8"
            >
            {groupedActivities.map(({ date, activities }) => (
              <div key={date} className="space-y-3 sm:space-y-4">
                {/* Improved date header */}
                <div className="flex items-center gap-3 sm:gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-medium text-gray-200">{date}</h3>
                  </div>
                  <Separator className="flex-1 bg-gray-700/50" />
                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                {/* Activity cards with improved spacing */}
                <div className="space-y-3 sm:space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ActivityCard 
                        activity={activity} 
                        onAddReaction={(activityId, emoji) => addReaction({ activityId, emoji })}
                        onAddComment={(activityId, content) => addComment({ activityId, content })}
                        onDeleteComment={(commentId) => deleteComment(commentId)}
                        onProfileClick={handleOpenProfile}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        </div>
      )}

      {/* Profile Card Modal */}
      <ProfileCardModal
        isOpen={profileModalOpen}
        userId={selectedUserId || ""}
        onClose={handleCloseProfile}
        onFollow={handleFollowUser}
        onUnfollow={handleUnfollowUser}
        onMessage={handleMessageUser}
        onShare={handleShareProfile}
        currentUserId={undefined} // TODO: Get from auth context
      />
    </div>
  );
});

FriendActivityFeed.displayName = 'FriendActivityFeed';
