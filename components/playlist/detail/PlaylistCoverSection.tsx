"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Playlist } from "@/types/playlist";

interface PlaylistCoverSectionProps {
  playlist: Playlist;
  isBookmarked: boolean;
  isLiked: boolean;
  onShare: () => void;
  onBookmark: () => void;
  onLike: () => void;
}

export const PlaylistCoverSection: React.FC<PlaylistCoverSectionProps> = ({
  playlist,
  isBookmarked,
  isLiked,
  onShare,
  onBookmark,
  onLike,
}) => {
  if (!playlist.games || playlist.games.length === 0) {
    return null;
  }

  return (
    <div className="relative h-48 md:h-64 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-6 gap-1">
        {playlist.games.slice(0, 12).map((game) => (
          <div key={game.id} className="relative aspect-video">
            <Image
              src={
                game.background_image ||
                game.cover_url ||
                "/api/placeholder/400/600"
              }
              alt={game.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onShare}
          className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/40"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBookmark}
          className={cn(
            "bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/40",
            isBookmarked && "bg-yellow-500/20 text-yellow-400"
          )}
        >
          <Bookmark
            className={cn("w-4 h-4", isBookmarked && "fill-current")}
          />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onLike}
          className={cn(
            "bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/40",
            isLiked && "bg-red-500/20 text-red-400"
          )}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </Button>
      </div>
    </div>
  );
};