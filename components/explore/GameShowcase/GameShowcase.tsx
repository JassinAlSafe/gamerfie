"use client";

import { memo, useCallback } from "react";
import { Game } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { GameCard } from "../../shared/GameCard/GameCard";
import { PlaylistHeader } from "./components/PlaylistHeader";

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
    games = [],
    type = "featured",
  }: GameShowcaseProps) => {
    const { user } = useAuthStore();
    const router = useRouter();
    const isAdmin = user?.profile?.role === "admin";

    const handleEditPlaylist = useCallback(() => {
      if (playlistId) {
        router.push(`/admin/playlists/${playlistId}/edit`);
      }
    }, [playlistId, router]);

    // Don't render if no games
    if (!games || games.length === 0) {
      return null;
    }

    return (
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-purple-950/50 to-indigo-950/50 p-8 backdrop-blur-sm">
        <PlaylistHeader
          date={date}
          title={title}
          description={description}
          type={type}
          playlistId={playlistId}
          isAdmin={isAdmin}
          onEditClick={handleEditPlaylist}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {games.slice(0, 5).map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              variant="showcase"
              priority={index < 2}
              showActions
            />
          ))}
        </div>
      </div>
    );
  }
);

GameShowcase.displayName = "GameShowcase";
