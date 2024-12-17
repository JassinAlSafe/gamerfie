"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Gamepad2, Loader2, AlertCircle, ChevronDown, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchUserGames, updateGameStatus } from "@/utils/game-utils";
import { ProcessedGame, GameStatus } from "@/types/game";
import { GameSkeletonGrid } from "./game-skeleton";
import { GameFilters } from "./game-filters";
import { useProfile } from "@/hooks/use-profile";

const GAMES_PER_PAGE = 24;

interface GamesTabProps {
  userId: string;
  filters?: GameFilters;
}

interface PageResult {
  userGames: ProcessedGame[];
  nextPage: number | undefined;
  hasMore: boolean;
}

export function GamesTab({ userId, filters = { status: 'all', sortBy: 'recent', sortOrder: 'desc' } }: GamesTabProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery<PageResult, Error>({
    queryKey: ["userGames", userId, filters],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return null;
      
      try {
        const games = await fetchUserGames(
          userId,
          pageParam * GAMES_PER_PAGE,
          GAMES_PER_PAGE
        );
        
        return {
          userGames: games || [],
          nextPage: games?.length === GAMES_PER_PAGE ? pageParam + 1 : undefined,
          hasMore: games?.length === GAMES_PER_PAGE
        };
      } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: !!userId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ gameId, newStatus }: { gameId: string; newStatus: string }) => 
      updateGameStatus(supabase, gameId, newStatus, userId),
    onSuccess: () => {
      toast.success("Game status updated");
      queryClient.invalidateQueries({ queryKey: ["userGames"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: () => {
      toast.error("Failed to update game status");
    }
  });

  const sortedGames = useMemo(() => {
    if (!data?.pages) return [];

    const allGames = data.pages.flatMap(page => page.userGames)
      .filter(Boolean)
      .filter(game => filters.status === 'all' || game.status === filters.status);

    return [...allGames].sort((a, b) => {
      if (filters.sortBy === 'name') {
        return filters.sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (filters.sortBy === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return filters.sortOrder === 'asc' 
          ? ratingA - ratingB
          : ratingB - ratingA;
      }
      // Default: sort by recent (created_at)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return filters.sortOrder === 'asc' 
        ? dateA - dateB
        : dateB - dateA;
    });
  }, [data?.pages, filters]);

  const formatStatus = (status: string | undefined): string => {
    if (!status) return '';
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isAuthenticated) {
    router.push("/signin");
    return null;
  }

  if (status === "pending" || status === "loading") {
    return <GameSkeletonGrid />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error loading games</h2>
        <p className="text-center max-w-md">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button onClick={() => router.refresh()} className="mt-4 bg-red-500 hover:bg-red-600">
          Try Again
        </Button>
      </div>
    );
  }

  const viewStyle = profile?.settings?.library?.view || 'grid';

  return (
    <div className="space-y-8">
      {viewStyle === 'grid' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-2 md:px-0"
        >
          {sortedGames.map((game, index) => (
            <GameCard 
              key={game.id} 
              game={game} 
              index={index}
              onStatusChange={(newStatus) => 
                updateStatusMutation.mutate({ gameId: game.id, newStatus })
              }
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {sortedGames.map((game, index) => (
            <GameListItem 
              key={game.id} 
              game={game} 
              index={index}
              onStatusChange={(newStatus) => 
                updateStatusMutation.mutate({ gameId: game.id, newStatus })
              }
            />
          ))}
        </motion.div>
      )}

      {hasNextPage && (
        <div className="text-center mt-12">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Games"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface GameCardProps {
  game: ProcessedGame;
  index: number;
  onStatusChange: (status: GameStatus) => void;
}

function GameCard({ game, index, onStatusChange }: GameCardProps) {
  const router = useRouter();
  const imageUrl = useMemo(() => {
    if (!game.cover?.url) return '';
    const url = game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url;
    return url.replace('t_thumb', 't_1080p').replace('t_micro', 't_1080p');
  }, [game.cover?.url]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.status-dropdown')) {
      return;
    }
    router.push(`/game/${game.id}`);
  }, [game.id, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative cursor-pointer rounded-xl transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-800/80 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={index < 12}
            quality={100}
            loading={index < 12 ? "eager" : "lazy"}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src.includes('t_1080p')) {
                img.src = img.src.replace('t_1080p', 't_cover_big');
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800/90 backdrop-blur-sm">
            <Gamepad2 className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <GameCardOverlay game={game} onStatusChange={onStatusChange} />
      </div>
    </motion.div>
  );
}

const GameCardOverlay = memo(({ game, onStatusChange }: { game: ProcessedGame; onStatusChange: (status: GameStatus) => void }) => {
  const statusColors = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500"
  } as const;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
      onClick={handleClick}
    >
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-sm sm:text-base truncate mb-2 drop-shadow-lg">
          {game.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-black/40 rounded-full px-3 py-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColors[game.status as keyof typeof statusColors] || "bg-gray-500"} shadow-glow`} />
              <p className="text-gray-200 text-xs sm:text-sm font-medium">
                {game.status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </p>
            </div>
            <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300 text-xs">{game.playTime || 0}h</span>
            </div>
            {game.completionPercentage !== null && (
              <div className="flex items-center space-x-1 bg-black/40 rounded-full px-2 py-1">
                <BarChart3 className="w-3 h-3 text-gray-400" />
                <span className="text-gray-300 text-xs">{game.completionPercentage}%</span>
              </div>
            )}
          </div>
          <div className="status-dropdown">
            <StatusDropdown onStatusChange={onStatusChange} />
          </div>
        </div>
      </div>
    </div>
  );
});

GameCardOverlay.displayName = 'GameCardOverlay';

const StatusDropdown = memo(({ onStatusChange }: { onStatusChange: (status: GameStatus) => void }) => {
  const statusOptions = [
    { value: 'want_to_play' as GameStatus, label: 'Want to Play', color: 'text-yellow-400' },
    { value: 'playing' as GameStatus, label: 'Playing', color: 'text-green-400' },
    { value: 'completed' as GameStatus, label: 'Completed', color: 'text-blue-400' },
    { value: 'dropped' as GameStatus, label: 'Dropped', color: 'text-red-400' }
  ];

  const handleStatusChange = (status: GameStatus) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(status);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/30 hover:text-white focus:ring-2 focus:ring-white/30 transition-all duration-200 rounded-lg"
        >
          <ChevronDown className="h-4 w-4 text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={5}
        className="w-44 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100 z-50"
      >
        <div className="relative space-y-0.5">
          {statusOptions.map(({ value, label, color }) => (
            <DropdownMenuItem
              key={value}
              onClick={handleStatusChange(value)}
              className="flex items-center px-3 py-2 text-sm hover:bg-white/10 rounded-md transition-all duration-150 focus:bg-white/10 focus:text-white"
            >
              <span className={`${color} font-medium`}>
                {label}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

StatusDropdown.displayName = 'StatusDropdown';

const GameListItem = memo(({ game, index, onStatusChange }: GameCardProps) => {
  const router = useRouter();
  const imageUrl = useMemo(() => {
    if (!game.cover?.url) return '';
    const url = game.cover.url.startsWith('//') ? `https:${game.cover.url}` : game.cover.url;
    return url.replace('t_thumb', 't_cover_small').replace('t_micro', 't_cover_small');
  }, [game.cover?.url]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.status-dropdown')) {
      return;
    }
    router.push(`/game/${game.id}`);
  }, [game.id, router]);

  const statusColors = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500"
  } as const;

  const statusLabels = {
    playing: "Playing",
    completed: "Completed",
    want_to_play: "Want to Play",
    dropped: "Dropped"
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative cursor-pointer rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex items-center p-4 space-x-4">
        <div className="relative w-16 h-20 overflow-hidden rounded-md">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={game.name}
              fill
              className="object-cover"
              priority={index < 12}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <Gamepad2 className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-white font-semibold">{game.name}</h3>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${statusColors[game.status as keyof typeof statusColors] || "bg-gray-500"} shadow-glow`} />
              <span className="text-sm text-gray-400">
                {game.status?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {game.playTime || 0}h
            </div>
            {game.completionPercentage !== null && (
              <div className="flex items-center text-sm text-gray-400">
                <BarChart3 className="w-4 h-4 mr-1" />
                {game.completionPercentage}%
              </div>
            )}
          </div>
        </div>

        <div className="status-dropdown opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline"
                size="default"
                className="min-w-[140px] h-9 px-4 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[game.status as keyof typeof statusColors] || "bg-gray-500"} shadow-glow`} />
                    <span>{statusLabels[game.status as keyof typeof statusLabels] || "Set Status"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-60" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              sideOffset={5}
              className="w-[180px] bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
            >
              <div className="relative">
                {[
                  { value: 'want_to_play' as GameStatus, label: 'Want to Play', icon: '📋', color: 'text-yellow-400' },
                  { value: 'playing' as GameStatus, label: 'Playing', icon: '🎮', color: 'text-green-400' },
                  { value: 'completed' as GameStatus, label: 'Completed', icon: '✅', color: 'text-blue-400' },
                  { value: 'dropped' as GameStatus, label: 'Dropped', icon: '⏹️', color: 'text-red-400' }
                ].map(({ value, label, icon, color }) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStatusChange(value);
                    }}
                    className="flex items-center px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 rounded-md transition-all duration-150 focus:bg-white/10 focus:text-white group relative"
                  >
                    <span className="mr-3 text-base group-hover:scale-110 transition-transform duration-200" role="img" aria-label={label}>
                      {icon}
                    </span>
                    <span className={`${color} font-medium group-hover:text-white transition-colors duration-200`}>
                      {label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
});

GameListItem.displayName = 'GameListItem';
