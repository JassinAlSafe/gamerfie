"use client";

import Image from "next/image";
import { type ProcessedGame } from "@/types/game";
import { getCoverImageUrl } from "@/utils/image-utils";

export function GameCard({ game }: { game: ProcessedGame }) {
  const coverUrl = game.cover_url
    ? getCoverImageUrl(game.cover_url)
    : "/placeholder-game.jpg";

  return (
    <div className="relative group rounded-lg overflow-hidden border border-white/5 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-200">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={coverUrl}
          alt={game.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {game.status && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/90 text-white border border-white/10">
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{game.name}</h3>
        {game.first_release_date && (
          <p className="text-sm text-gray-400 mt-1">
            {new Date(game.first_release_date * 1000).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
}
