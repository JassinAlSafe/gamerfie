"use client";

import { useEffect } from "react";
import { Block } from "../../Block";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { Game, GameStatus } from "@/types/game";
import { formatDistanceToNow } from "date-fns";
import { Trophy, Clock, Star, Gamepad2, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";

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
    <div className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-accent/20" />
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="96px"
          priority={false}
          quality={100}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-accent/40">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const formatPlaytime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="group flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <GameCover src={game.cover_url || game.name} alt={game.title} />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-base font-medium truncate">{game.name}</h4>
          {game.status && (
            <Badge
              variant="secondary"
              className={cn(
                gameStatusColors[game.status],
                "rounded-full text-xs font-medium"
              )}
            >
              {game.status.replace("_", " ")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {game.playtime > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatPlaytime(game.playtime)}</span>
            </div>
          )}
          {game.achievements && (
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" />
              <span>
                {game.achievements.completed}/{game.achievements.total}
              </span>
            </div>
          )}
          {game.rating && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span>{Number(game.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-0.5 text-xs rounded-md bg-accent/50 text-muted-foreground"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {game.lastPlayed && (
          <div className="text-xs text-muted-foreground">
            Last played {formatDistanceToNow(new Date(game.lastPlayed))} ago
          </div>
        )}
      </div>
    </div>
  );
}

function GameLibraryContent() {
  const { games, loading: isLoading } = useLibraryStore();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-3">
            <Skeleton className="h-36 w-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
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
          <p className="text-muted-foreground">No games in your library yet</p>
        </div>
      </div>
    );
  }

  // Sort games by lastPlayed
  const sortedGames = [...games]
    .sort((a, b) => {
      const dateA = a.lastPlayed ? new Date(a.lastPlayed) : new Date(0);
      const dateB = b.lastPlayed ? new Date(b.lastPlayed) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);

  return (
    <div className="divide-y divide-white/10">
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
  const fetchUserLibrary = useLibraryStore((state) => state.fetchUserLibrary);

  useEffect(() => {
    if (user?.id) {
      fetchUserLibrary(user.id);
    }
  }, [fetchUserLibrary, user?.id]);

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
        <div className="flex-1 p-4 overflow-y-auto">
          <GameLibraryContent />
        </div>
      </div>
    </Block>
  );
}
