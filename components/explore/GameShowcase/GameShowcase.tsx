"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Game } from "@/types";
import { Playlist } from "@/types/playlist";
import { useAuthStore } from "@/stores/useAuthStore";
import { PlaylistService } from "@/services/playlistService";
import { useRouter } from "next/navigation";
import { GameCard } from "./components/GameCard";
import { PlaylistHeader } from "./components/PlaylistHeader";
import { GameShowcaseSkeleton } from "./components/GameShowcaseSkeleton";

export interface GameShowcaseProps {
  playlistId?: string;
  title: string;
  description: string;
  date: string;
  games?: Game[];
  type?: "featured" | "collection" | "event" | "genre" | "custom";
  className?: string;
}

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
            setGames((playlist.games as Game[]) || []);
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
          setGames((updatedPlaylist.games as Game[]) || []);
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
