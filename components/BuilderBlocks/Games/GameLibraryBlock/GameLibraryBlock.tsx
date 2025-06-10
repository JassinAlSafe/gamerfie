"use client";

import { useEffect } from "react";
import { Block } from "../../Block";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Star,
  Gamepad2,
  ImageIcon,
  LineChart,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/hooks/User/useUser";
import React from "react";
import { safeParseGenres } from "@/utils/json-utils";

// Define the types locally to avoid import issues
type GameStatus = "playing" | "completed" | "want_to_play" | "dropped";

// Define a custom Game type to avoid import issues
interface GameWithProgress {
  id: string;
  name?: string;
  title?: string;
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
  status?: GameStatus;
  cover_url?: string | null;
  coverImage?: string;
  genres?: Array<{ id: string; name: string }> | string;
  updated_at?: string;
}

const gameStatusColors: Record<GameStatus, string> = {
  playing: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  completed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  want_to_play: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  dropped: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export interface GameLibraryBlockProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function GameCover({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-[3/4] w-16 flex-shrink-0 overflow-hidden rounded-md">
      <div className="absolute inset-0 bg-accent/20" />
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="64px"
          priority={false}
          quality={100}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-accent/40">
          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function formatGameStatus(status: GameStatus): string {
  switch (status) {
    case "want_to_play":
      return "Want to Play";
    case "playing":
      return "Playing";
    case "completed":
      return "Completed";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
}

function GameCard({ game }: { game: GameWithProgress }) {
  const parsedGenres = safeParseGenres(game.genres);

  return (
    <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <GameCover
        src={game.cover_url || game.coverImage || null}
        alt={game.name || game.title || ""}
      />

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium truncate">{game.name}</h4>
          {game.status && (
            <Badge
              variant="secondary"
              className={cn(
                gameStatusColors[game.status],
                "text-[10px] px-1.5 py-0.5 font-medium"
              )}
            >
              {formatGameStatus(game.status)}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {game.hoursPlayed !== undefined && game.hoursPlayed > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{Math.round(game.hoursPlayed)}h</span>
            </div>
          )}
          {game.progress !== undefined && (
            <div className="flex items-center gap-1">
              <LineChart className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-blue-400">
                {Math.round(game.progress)}%
              </span>
            </div>
          )}
          {game.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400">
                {Number(game.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {parsedGenres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {parsedGenres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="px-1.5 py-0.5 text-[10px] rounded-md bg-accent/50 text-muted-foreground"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {game.updated_at && (
          <p className="text-[10px] text-muted-foreground/70">
            Updated {formatDistanceToNow(new Date(game.updated_at))} ago
          </p>
        )}
      </div>
    </div>
  );
}

function GameLibraryContent() {
  const { games, loading: isLoading } = useLibraryStore();

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-2">
            <Skeleton className="h-24 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Gamepad2 className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            No games in your library yet
          </p>
        </div>
      </div>
    );
  }

  // Sort games by updated_at and ensure they have the correct type
  const sortedGames = [...games]
    .sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
      const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3) as GameWithProgress[];

  return (
    <div className="divide-y divide-border/5">
      {sortedGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

export function GameLibraryBlock({
  size = "sm",
  className,
}: GameLibraryBlockProps) {
  const { user } = useUser();
  const [showMore, setShowMore] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastUserIdRef = React.useRef<string | null>(null);

  // Only fetch library when user ID actually changes
  useEffect(() => {
    if (user?.id && user.id !== lastUserIdRef.current) {
      lastUserIdRef.current = user.id;
      // Use direct store access to avoid dependency issues
      useLibraryStore.getState().fetchUserLibrary(user.id);
    }
  }, [user?.id]); // Removed fetchUserLibrary from dependencies

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setShowMore(isBottom);
  }, []);

  return (
    <Block
      size={size}
      variant="premium"
      hover={true}
      className={cn("h-[360px]", className)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-purple-200/10">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-purple-500" />
            <h3 className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Recent Games
            </h3>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <GameLibraryContent />
          <Link
            href="/profile/games"
            className={cn(
              "sticky bottom-0 left-0 right-0 flex items-center justify-center gap-1 p-2 text-xs",
              "text-muted-foreground hover:text-purple-500 transition-all duration-300",
              "bg-gradient-to-t from-background via-background/95 to-transparent",
              "border-t border-purple-200/10 group",
              showMore
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            Show More
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Block>
  );
}
