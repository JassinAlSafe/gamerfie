"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { CalendarDays, ArrowRight, Edit, Plus } from "lucide-react";
import Image from "next/image";
import { Game } from "@/types/game";
import { Playlist } from "@/types/playlist";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { PlaylistService } from "@/services/playlistService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface GameShowcaseProps {
  playlistId?: string;
  title: string;
  description: string;
  date: string;
  games?: Game[];
  type?: "featured" | "collection" | "event" | "genre" | "custom";
  className?: string;
}

const GameShowcaseSkeleton = memo(() => (
  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 p-8 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full bg-white/5" />
          <Skeleton className="w-24 h-4 rounded-full bg-white/5" />
        </div>
        <Skeleton className="w-64 h-8 rounded-lg bg-white/5" />
        <Skeleton className="w-96 h-4 rounded-full bg-white/5" />
      </div>
      <Skeleton className="w-24 h-10 rounded-lg bg-white/5" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5"
        >
          <Skeleton className="absolute inset-0 bg-white/5" />
        </div>
      ))}
    </div>
  </div>
));

GameShowcaseSkeleton.displayName = "GameShowcaseSkeleton";

const GameCard = memo(({ game }: { game: Game }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5">
      {game.coverImage && !imageError ? (
        <>
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-white/5" />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1">
          {game.title}
        </h3>
        <p className="text-sm text-white/60 mb-2">
          {game.platforms && game.platforms.length > 0
            ? game.platforms[0].name
            : "Coming Soon"}
        </p>
        {game.releaseDate && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs">
            <CalendarDays className="w-3 h-3" />
            {new Date(game.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}
          </div>
        )}
      </div>
      <Link href={`/games/${game.id}`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
          <Button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Link>
      <Button
        size="icon"
        variant="ghost"
        className="absolute bottom-3 right-3 w-7 h-7 bg-gradient-to-b from-zinc-800/95 to-zinc-900/95 hover:from-zinc-700/95 hover:to-zinc-800/95 text-zinc-300 z-10 rounded-[4px] shadow-sm backdrop-blur-sm border border-zinc-800/50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Add your game addition logic here
        }}
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
});

GameCard.displayName = "GameCard";

const PlaylistHeader = memo(
  ({
    date,
    title,
    description,
    type,
    playlistId,
    isAdmin,
    onEditClick,
  }: {
    date: string;
    title: string;
    description: string;
    type: string;
    playlistId?: string;
    isAdmin: boolean;
    onEditClick: () => void;
  }) => (
    <div className="flex items-start justify-between mb-8">
      <div className="space-y-2 max-w-[70%]">
        <div className="flex items-center gap-2 text-purple-400">
          <CalendarDays className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{date}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-3xl font-bold text-white line-clamp-2 cursor-default">
                {title}
              </h2>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md bg-gray-900/95 text-white border-white/10"
            >
              {title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-white/60 line-clamp-2 cursor-default">
                {description}
              </p>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md bg-gray-900/95 text-white border-white/10"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAdmin && playlistId && (
          <Button
            onClick={onEditClick}
            variant="ghost"
            className="text-white/80 hover:bg-white/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        <Link href={`/playlists/${type}`}>
          <Button className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors">
            See all
          </Button>
        </Link>
      </div>
    </div>
  )
);

PlaylistHeader.displayName = "PlaylistHeader";

export const GameShowcase = memo(
  ({
    playlistId,
    title,
    description,
    date,
    games: propGames,
    type = "featured",
  }: GameShowcaseProps) => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const { user } = useAuthStore();
    const router = useRouter();
    const isAdmin = user?.profile?.role === "admin";

    useEffect(() => {
      let isMounted = true;

      const fetchPlaylist = async () => {
        if (!playlistId) return;

        setIsLoading(true);
        try {
          const playlist = await PlaylistService.getPlaylist(playlistId);
          if (isMounted && playlist) {
            setPlaylist(playlist);
            setGames(playlist.games || []);
          }
        } catch (error) {
          console.error("Failed to fetch playlist:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      if (playlistId) {
        fetchPlaylist();
      } else if (propGames) {
        setGames(propGames);
      }

      return () => {
        isMounted = false;
      };
    }, [playlistId, propGames]);

    useEffect(() => {
      if (!playlistId) return;

      const unsubscribe = PlaylistService.subscribeToPlaylist(
        playlistId,
        (updatedPlaylist) => {
          setPlaylist(updatedPlaylist);
          setGames(updatedPlaylist.games || []);
        }
      );

      return unsubscribe;
    }, [playlistId]);

    const handleEditPlaylist = useCallback(() => {
      if (playlistId) {
        router.push(`/admin/playlists/${playlistId}/edit`);
      }
    }, [playlistId, router]);

    if (isLoading) {
      return <GameShowcaseSkeleton />;
    }

    return (
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 p-8 backdrop-blur-sm">
        <PlaylistHeader
          date={date}
          title={playlist?.title || title}
          description={playlist?.description || description}
          type={type}
          playlistId={playlistId}
          isAdmin={isAdmin}
          onEditClick={handleEditPlaylist}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {games.slice(0, 5).map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    );
  }
);

GameShowcase.displayName = "GameShowcase";
