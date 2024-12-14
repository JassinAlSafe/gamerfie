"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Gamepad2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchUserGames, updateGameStatus } from "@/utils/game-utils";
import { ProcessedGame, GameStatus } from "@/types/game";
import { GameSkeletonGrid } from "./game-skeleton";

const GAMES_PER_PAGE = 24;

interface GamesTabProps {
  userId: string;
}

export function GamesTab({ userId }: GamesTabProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, [supabase]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ["userGames", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * GAMES_PER_PAGE;
      const end = start + GAMES_PER_PAGE - 1;
      const games = await fetchUserGames({ supabase, start, end, userId });
      return {
        userGames: games,
        nextPage: games.length === GAMES_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: games.length === GAMES_PER_PAGE
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ gameId, newStatus }: { gameId: string; newStatus: string }) => 
      updateGameStatus(supabase, gameId, newStatus, userId),
    onSuccess: () => {
      toast.success("Game status updated");
      queryClient.invalidateQueries(["userGames"]);
      queryClient.invalidateQueries(["userStats"]);
    },
    onError: () => {
      toast.error("Failed to update game status");
    }
  });

  if (!isAuthenticated) {
    router.push("/signin");
    return null;
  }

  if (status === "loading") {
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

  const games = data?.pages.flatMap(page => page.userGames).filter(Boolean) || [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-2 md:px-0"
      >
        {games.map((game, index) => {
          if (!game?.id) {
            console.warn('Invalid game data:', game);
            return null;
          }

          return (
            <GameCard 
              key={game.id} 
              game={game as ProcessedGame} 
              index={index}
              onStatusChange={(newStatus) => 
                updateStatusMutation.mutate({ gameId: game.id, newStatus })
              }
            />
          );
        })}
      </motion.div>

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
  };

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
          <div className="flex items-center space-x-2 bg-black/40 rounded-full px-3 py-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${statusColors[game.status] || "bg-gray-500"} shadow-glow`} />
            <p className="text-gray-200 text-xs sm:text-sm font-medium">
              {game.status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </p>
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
    { value: 'want_to_play', label: 'Want to Play', icon: '📋', color: 'text-yellow-400' },
    { value: 'playing', label: 'Playing', icon: '🎮', color: 'text-green-400' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'text-blue-400' },
    { value: 'dropped', label: 'Dropped', icon: '⏹️', color: 'text-red-400' }
  ];

  const handleStatusChange = (status: GameStatus) => (e: Event) => {
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
        className="w-56 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100 z-50"
      >
        <div className="relative">
          {statusOptions.map(({ value, label, icon, color }) => (
            <DropdownMenuItem
              key={value}
              onClick={handleStatusChange(value)}
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
  );
});

StatusDropdown.displayName = 'StatusDropdown';
