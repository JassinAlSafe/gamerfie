"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Clock,
  BarChart3,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  RefreshCw,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCoverImageUrl } from "@/utils/image-utils";
import { GameStatusDropdown } from "@/components/game/game-status-dropdown";
import { DeleteFromLibraryButton } from "../delete-from-library-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Import proper types from the types file
import type { GameStatus } from "@/types";

// Database game data structure from joined query
interface DatabaseGameData {
  id: string;
  name: string;
  cover_url?: string | null;
}

// Component interfaces - keeping this focused on what components actually need

// Extended interface for component usage
interface GameWithUserData {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  playTime: number;
  created_at: string;
  updated_at: string;
  completionPercentage: number;
  achievementsCompleted: number;
  userRating?: number;
  notes?: string;
  lastPlayedAt?: string;
  coverUrl?: string;
  games: DatabaseGameData;
}

interface GamesTabProps {
  filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    platform?: string;
    genre?: string;
  };
}

// Enhanced Search and Filter Component
const GamesSearchAndFilter = React.memo(({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
  gameStats,
  isRefreshing,
  onRefresh,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: { status: string; sortBy: string; sortOrder: string };
  onFilterChange: (filters: { status?: string; sortBy?: string; sortOrder?: string }) => void;
  gameStats: { total: number; playing: number; completed: number; wantToPlay: number; dropped: number };
  isRefreshing: boolean;
  onRefresh: () => void;
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Games", count: gameStats.total },
    { value: "playing", label: "Playing", count: gameStats.playing },
    { value: "completed", label: "Completed", count: gameStats.completed },
    { value: "want_to_play", label: "Want to Play", count: gameStats.wantToPlay },
    { value: "dropped", label: "Dropped", count: gameStats.dropped },
  ];

  const sortOptions = [
    { value: "recent", label: "Recently Added" },
    { value: "name", label: "Name" },
    { value: "playtime", label: "Play Time" },
    { value: "rating", label: "Rating" },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.status !== "all") count++;
    if (activeFilters.sortBy !== "recent") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeFilters, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Bar with Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your games..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Quick Status Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            variant={activeFilters.status === status.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ status: status.value })}
            className={`whitespace-nowrap ${
              activeFilters.status === status.value
                ? "bg-purple-500 hover:bg-purple-600 border-purple-500"
                : "border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10"
            }`}
          >
            {status.label}
            <Badge variant="secondary" className="ml-2 text-xs">
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={activeFilters.sortBy}
                      onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                      className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-md px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        onFilterChange({
                          sortOrder: activeFilters.sortOrder === "asc" ? "desc" : "asc",
                        })
                      }
                      className="border-gray-700/50 hover:border-purple-500/50"
                    >
                      {activeFilters.sortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSearchChange("");
                      onFilterChange({ status: "all", sortBy: "recent", sortOrder: "desc" });
                    }}
                    className="w-full border-gray-700/50 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Pills */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:text-purple-200"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {activeFilters.status !== "all" && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Status: {statusOptions.find(s => s.value === activeFilters.status)?.label}
              <button
                onClick={() => onFilterChange({ status: "all" })}
                className="ml-1 hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {activeFilters.sortBy !== "recent" && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border border-green-500/30">
              Sort: {sortOptions.find(s => s.value === activeFilters.sortBy)?.label} ({activeFilters.sortOrder})
              <button
                onClick={() => onFilterChange({ sortBy: "recent", sortOrder: "desc" })}
                className="ml-1 hover:text-green-200"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});

GamesSearchAndFilter.displayName = 'GamesSearchAndFilter';

// List View Component
const GameListItem = React.memo(({
  game,
  onDelete,
  handleStatusChange,
}: {
  game: GameWithUserData;
  onDelete: () => void;
  handleStatusChange: (gameId: string, newStatus: GameStatus) => Promise<void>;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => {
    return game.games.cover_url
      ? getCoverImageUrl(game.games.cover_url)
      : undefined;
  }, [game.games.cover_url]); // Memoize the cover URL calculation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex items-center space-x-4 bg-gray-900/50 p-4 rounded-xl hover:bg-gray-800/70 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 hover:border-purple-500/20 backdrop-blur-sm cursor-pointer"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-white/5 group-hover:ring-purple-500/20 transition-all duration-300">
        {!imageError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.games.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-10 h-10 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-200">
          {game.games.name}
        </h3>
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(game.status)}`}
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
              {formatStatus(game.status)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
            <Clock className="w-4 h-4 mr-1" />
            {game.playTime}h
          </div>
          <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
            <BarChart3 className="w-4 h-4 mr-1" />
            {game.completionPercentage || 0}%
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <GameStatusDropdown
          status={game.status}
          gameId={game.game_id}
          onStatusChange={(newStatus) =>
            handleStatusChange(game.game_id, newStatus)
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => {
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {showDeleteDialog && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl"
        >
          <DeleteFromLibraryButton
            gameId={game.game_id}
            gameName={game.games.name}
            onSuccess={() => {
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

GameListItem.displayName = 'GameListItem';

// Grid View Component
const GameGridItem = React.memo(({
  game,
  onDelete,
  handleStatusChange,
}: {
  game: GameWithUserData;
  onDelete: () => void;
  handleStatusChange: (gameId: string, newStatus: GameStatus) => Promise<void>;
}) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageError, setImageError] = useState(false);

  const coverUrl = useMemo(() => {
    // Get the cover URL from the games table
    const rawCoverUrl = game.games?.cover_url;

    if (!rawCoverUrl) {
      return undefined;
    }

    // Process the URL through our utility function
    return getCoverImageUrl(rawCoverUrl);
  }, [game.games?.cover_url]); // Optimal dependency - only re-compute when URL changes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-purple-500/20 backdrop-blur-sm"
      onClick={() => router.push(`/game/${game.game_id}`)}
    >
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-zinc-900/80 hover:bg-zinc-900"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => {
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="aspect-[3/4] bg-gray-900/80 relative">
        {!imageError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.games.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={100}
            priority={false}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Gamepad2 className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl mb-3 line-clamp-2">
              {game.games.name}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                    game.status
                  )}`}
                />
                <p className="text-gray-200 text-sm font-medium">
                  {formatStatus(game.status)}
                </p>
              </div>
              <GameStatusDropdown
                status={game.status}
                gameId={game.game_id}
                onStatusChange={(newStatus) =>
                  handleStatusChange(game.game_id, newStatus)
                }
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <Clock className="w-4 h-4 mr-1.5" />
                {game.playTime}h
              </div>
              <div className="flex items-center text-gray-300 text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-1.5" />
                {game.completionPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteDialog && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <DeleteFromLibraryButton
            gameId={game.game_id}
            gameName={game.games.name}
            onSuccess={() => {
              setShowDeleteDialog(false);
              onDelete();
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

GameGridItem.displayName = 'GameGridItem';

// Loading State Component
const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="aspect-[3/4] bg-gray-900/50 rounded-xl animate-pulse overflow-hidden border border-white/5"
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50" />
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ router }: { router: ReturnType<typeof useRouter> }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-16 text-center bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl border border-purple-500/20 backdrop-blur-sm"
  >
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center">
        <Gamepad2 className="w-12 h-12 text-purple-400" />
      </div>
    </div>
    <h2 className="text-3xl font-bold mb-4 text-white">Your Game Library is Empty</h2>
    <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
      Start building your gaming collection! Browse our catalog to discover new games and track your gaming journey.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={() => router.push("/games")}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
      >
        <Gamepad2 className="w-4 h-4 mr-2" />
        Browse Games
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/games/search")}
        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
      >
        Search Games
      </Button>
    </div>
  </motion.div>
);

export default function GamesTab({ filters }: GamesTabProps) {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const { libraryView } = useSettingsStore();
  const queryClient = useQueryClient();
  
  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || "all",
    sortBy: filters.sortBy || "recent",
    sortOrder: filters.sortOrder || "desc",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pull-to-refresh state
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const pullThreshold = 100;
  
  // Create the status change handler with proper dependencies
  const handleStatusChange = useMemo(
    () => createHandleStatusChange(queryClient, userId),
    [queryClient, userId]
  );

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkSession();
  }, [supabase]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    if (!userId || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["userGames", userId, "v3"],
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, isRefreshing, queryClient]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !containerRef.current) return;

    const currentY = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY - pullStartY);
    const progress = Math.min(pullDistance / pullThreshold, 1);

    setPullProgress(progress);

    if (pullDistance > 20) {
      e.preventDefault();
    }
  }, [isPulling, pullStartY, pullThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return;

    setIsPulling(false);
    
    if (pullProgress >= 1) {
      handleRefresh();
    }
    
    setPullProgress(0);
    setPullStartY(0);
  }, [isPulling, pullProgress, handleRefresh]);

  // Filter change handlers
  const handleFilterChange = useCallback((newFilters: Partial<typeof localFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Subscribe to realtime changes with optimized filtering and debouncing
  useEffect(() => {
    if (!userId) return;

    let debounceTimer: NodeJS.Timeout;
    let isSubscribed = true; // Guard against late updates
    
    const debouncedInvalidate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Only invalidate if component is still mounted and subscription is active
        if (isSubscribed) {
          queryClient.invalidateQueries({
            queryKey: ["userGames", userId, "v3"],
          });
        }
      }, 500); // 500ms debounce to prevent excessive refetches
    };

    const channel = supabase
      .channel(`user_games_${userId}`) // User-specific channel name
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_games",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Early return if component unmounted
          if (!isSubscribed) return;
          
          // Type-safe payload handling
          interface UserGamePayload {
            user_id?: string;
            id?: string;
            game_id?: string;
            status?: string;
            play_time?: number | null;
            completion_percentage?: number | null;
            achievements_completed?: number | null;
            user_rating?: number | null;
            notes?: string | null;
            last_played_at?: string | null;
            created_at?: string;
            updated_at?: string;
          }
          
          const newRecord = payload.new as UserGamePayload | null;
          const oldRecord = payload.old as UserGamePayload | null;
          
          // Only invalidate if the change affects this user's data
          if (newRecord?.user_id === userId || oldRecord?.user_id === userId) {
            debouncedInvalidate();
          }
        }
      )
      .subscribe();

    // Cleanup function with proper order
    return () => {
      isSubscribed = false; // Prevent any late updates
      clearTimeout(debounceTimer); // Clear pending debounce timer
      supabase.removeChannel(channel); // Remove subscription
    };
  }, [userId, queryClient, supabase]);

  const handleGameRemoval = useCallback(() => {
    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["userGames", userId, "v3"] });
  }, [queryClient, userId]);

  const { data: games, isLoading } = useQuery<GameWithUserData[]>({
    queryKey: ["userGames", userId, "v3"],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_games")
        .select(
          `
          id,
          user_id,
          game_id,
          status,
          play_time,
          created_at,
          updated_at,
          completion_percentage,
          achievements_completed,
          user_rating,
          notes,
          last_played_at,
          games (
            id,
            name,
            cover_url
          )
        `
        )
        .eq("user_id", userId)
        .order("last_played_at", { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(`Failed to fetch games: ${error.message}`);
      }

      // Transform the response to match our interface with proper type safety
      const mappedGames: GameWithUserData[] = (data ?? []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        game_id: item.game_id,
        status: item.status as GameStatus,
        playTime: item.play_time || 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completionPercentage: item.completion_percentage || 0,
        achievementsCompleted: item.achievements_completed || 0,
        userRating: item.user_rating || undefined,
        notes: item.notes || undefined,
        lastPlayedAt: item.last_played_at || undefined,
        games: item.games,
      }));

      return mappedGames;
    },
    enabled: !!userId,
  });

  const sortedGames = useMemo(() => {
    if (!games?.length) return [];
    
    let filtered = [...games];

    // Apply status filter
    if (localFilters.status !== "all") {
      filtered = filtered.filter((game) => game.status === localFilters.status);
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((game) => 
        game.games?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (localFilters.sortBy) {
        case "name":
          const nameA = a.games?.name || "";
          const nameB = b.games?.name || "";
          return localFilters.sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        case "playtime":
          const timeA = a.playTime || 0;
          const timeB = b.playTime || 0;
          return localFilters.sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        case "rating":
          const ratingA = a.userRating || 0;
          const ratingB = b.userRating || 0;
          return localFilters.sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
        case "recent":
        default:
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return localFilters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return filtered;
  }, [games, localFilters, searchQuery]);

  // Calculate game stats for the filter component
  const gameStats = useMemo(() => {
    if (!games?.length) return { total: 0, playing: 0, completed: 0, wantToPlay: 0, dropped: 0 };
    
    return games.reduce((stats, game) => {
      stats.total++;
      switch (game.status) {
        case "playing":
          stats.playing++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "want_to_play":
          stats.wantToPlay++;
          break;
        case "dropped":
          stats.dropped++;
          break;
      }
      return stats;
    }, { total: 0, playing: 0, completed: 0, wantToPlay: 0, dropped: 0 });
  }, [games]);

  const renderGameItem = useCallback((game: GameWithUserData) => {
    if (libraryView === "list") {
      return (
        <GameListItem
          key={game.game_id}
          game={game}
          onDelete={handleGameRemoval}
          handleStatusChange={handleStatusChange}
        />
      );
    }
    return (
      <GameGridItem
        key={game.game_id}
        game={game}
        onDelete={handleGameRemoval}
        handleStatusChange={handleStatusChange}
      />
    );
  }, [libraryView, handleGameRemoval, handleStatusChange]); // Memoize render function

  if (isLoading) return <LoadingState />;
  if (!userId) return <EmptyState router={router} />;

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Section */}
      <GamesSearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilters={localFilters}
        onFilterChange={handleFilterChange}
        gameStats={gameStats}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {pullProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex justify-center py-4"
          >
            <div className="flex items-center gap-2 text-purple-400">
              <RefreshCw 
                className={`w-5 h-5 transition-transform duration-200 ${
                  pullProgress >= 1 ? 'animate-spin' : ''
                }`}
                style={{ transform: `rotate(${pullProgress * 360}deg)` }}
              />
              <span className="text-sm font-medium">
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games Content */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {!games?.length ? (
          <EmptyState router={router} />
        ) : !sortedGames.length ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-16 text-center bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl border border-gray-700/30 backdrop-blur-sm"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-yellow-500/30 border border-orange-500/30 flex items-center justify-center">
                <Search className="w-12 h-12 text-orange-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">No Games Found</h2>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Your search didn't match any games in your library. Try adjusting your filters or search terms.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setLocalFilters({ status: "all", sortBy: "recent", sortOrder: "desc" });
              }}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              libraryView === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4"
                : "space-y-2 sm:space-y-3"
            }
          >
            {sortedGames.map(renderGameItem)}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(gameStatus: GameStatus): string {
  const colors: Record<GameStatus, string> = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500",
  };
  return colors[gameStatus] || "bg-gray-500";
}

function formatStatus(gameStatus: GameStatus): string {
  return gameStatus
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Type-safe status change handler factory
const createHandleStatusChange = (
  queryClient: ReturnType<typeof useQueryClient>, 
  userId: string | null
) => {
  return async (gameId: string, newStatus: GameStatus) => {
    if (!userId) {
      console.error('Cannot update game status: User not authenticated');
      throw new Error('User not authenticated');
    }

    const supabase = createClient();

    try {
      // Optimistic update - update cache first for better UX
      queryClient.setQueryData(
        ["userGames", userId, "v3"],
        (oldData: GameWithUserData[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(game => 
            game.game_id === gameId 
              ? { ...game, status: newStatus }
              : game
          );
        }
      );

      const { error } = await supabase
        .from("user_games")
        .update({ status: newStatus })
        .eq("game_id", gameId)
        .eq("user_id", userId);

      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({
          queryKey: ["userGames", userId, "v3"],
        });
        console.error("Failed to update game status:", error);
        throw new Error(`Failed to update game status: ${error.message}`);
      }

      // If successful, refresh data to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["userGames", userId, "v3"],
      });

    } catch (error) {
      console.error("Error updating game status:", error);
      
      // Revert optimistic update on any error
      queryClient.invalidateQueries({
        queryKey: ["userGames", userId, "v3"],
      });
      
      // Re-throw for component-level error handling
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  };
};
