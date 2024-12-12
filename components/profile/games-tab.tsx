"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Gamepad2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchUserGames, updateGameStatus } from "@/utils/game-utils";
import { Game, GameStats } from "@/types/game";

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
      return fetchUserGames({ supabase, start, end, userId });
    },
    getNextPageParam: (lastPage) => lastPage?.hasMore ? lastPage.nextPage : undefined
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
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
        <p className="text-xl font-semibold text-gray-300">Loading your games...</p>
      </div>
    );
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

  const games = data?.pages.flatMap(page => page.userGames) || [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        {games.map((game, index) => (
          <GameCard 
            key={game.id} 
            game={game} 
            index={index}
            onStatusChange={(newStatus) => 
              updateStatusMutation.mutate({ gameId: game.game_id, newStatus })
            }
          />
        ))}
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
  game: Game;
  index: number;
  onStatusChange: (status: string) => void;
}

function GameCard({ game, index, onStatusChange }: GameCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the status dropdown
    if ((e.target as HTMLElement).closest('.status-dropdown')) {
      return;
    }
    router.push(`/game/${game.game_id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-800 relative">
        {game.cover ? (
          <Image
            src={game.cover.url.replace("t_thumb", "t_cover_big")}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Gamepad2 className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <GameCardOverlay game={game} onStatusChange={onStatusChange} />
      </div>
    </motion.div>
  );
}

function GameCardOverlay({ game, onStatusChange }: { game: Game; onStatusChange: (status: string) => void }) {
  const statusColors = {
    playing: "bg-green-500",
    completed: "bg-blue-500",
    want_to_play: "bg-yellow-500",
    dropped: "bg-red-500"
  };

  // Add click handler to stop propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      onClick={handleClick}  // Add click handler here
    >
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-bold text-sm sm:text-base truncate mb-1">
          {game.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${statusColors[game.status] || "bg-gray-500"}`} />
            <p className="text-gray-300 text-xs sm:text-sm">
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
}

function StatusDropdown({ onStatusChange }: { onStatusChange: (status: string) => void }) {
  const statusOptions = [
    { value: 'want_to_play', label: 'Want to Play', icon: '📋', color: 'text-yellow-400' },
    { value: 'playing', label: 'Playing', icon: '🎮', color: 'text-green-400' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'text-blue-400' },
    { value: 'dropped', label: 'Dropped', icon: '⏹️', color: 'text-red-400' }
  ];

  const handleStatusChange = (status: string) => (e: Event) => {
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
          className="h-8 w-8 p-0 hover:bg-white/20 hover:text-white focus:ring-2 focus:ring-white/20 transition-all duration-200"
        >
          <ChevronDown className="h-4 w-4 text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={5}
        className="w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-lg p-1 animate-in fade-in-0 zoom-in-95 duration-100 z-50"
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
}
