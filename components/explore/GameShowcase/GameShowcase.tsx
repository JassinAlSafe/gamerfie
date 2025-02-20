"use client";

import { CalendarDays, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Game } from "@/types/game";
import { Playlist } from "@/types/playlist";
import { Skeleton } from "@/components/ui/skeleton";
import { useRAWG } from "@/hooks/use-rawg";
import { PlaylistService } from "@/services/playlistService";

export interface GameShowcaseProps {
  playlistId?: string;
  title: string;
  description: string;
  date: string;
  games?: Game[];
}

function GameShowcaseSkeleton() {
  return (
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
  );
}

export function GameShowcase({
  playlistId,
  title,
  description,
  date,
  games: propGames,
}: GameShowcaseProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (playlistId) {
      setIsLoading(true);
      PlaylistService.getPlaylist(playlistId)
        .then((playlist) => {
          if (playlist) {
            setPlaylist(playlist);
            setGames(playlist.games || []);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch playlist:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (propGames) {
      setGames(propGames);
    }
  }, [playlistId, propGames]);

  // Subscribe to real-time changes if playlistId is provided
  useEffect(() => {
    if (!playlistId) return;

    const unsubscribe = PlaylistService.subscribeToPlaylist(
      playlistId,
      (updatedPlaylist) => {
        setPlaylist(updatedPlaylist);
        setGames(updatedPlaylist.games || []);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [playlistId]);

  if (isLoading) {
    return <GameShowcaseSkeleton />;
  }

  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm">{date}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            {playlist?.title || title}
          </h2>
          <p className="text-white/60 max-w-2xl">
            {playlist?.description || description}
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors">
          See all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/5"
          >
            {game.coverImage ? (
              <>
                <Image
                  src={game.coverImage}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    // Fallback to skeleton on error
                    e.currentTarget.parentElement?.classList.add("bg-white/5");
                    e.currentTarget.remove();
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <Skeleton className="absolute inset-0 bg-white/5" />
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
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
