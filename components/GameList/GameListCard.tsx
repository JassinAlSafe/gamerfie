"use client";

import { memo } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

import { getCoverImageUrl } from "@/utils/image-utils";
import type { GameListItem } from "@/types/gamelist/game-list";

interface GameListCardProps {
  game: GameListItem;
}

export const GameListCard = memo<GameListCardProps>(function GameListCard({ game }) {
  return (
    <div className="group w-full">
      {/* Game Cover - Fixed aspect ratio for consistency */}
      <div className="relative aspect-[3/4] w-full bg-gray-800 rounded-lg overflow-hidden">
        {game.cover_url ? (
          <Image
            src={getCoverImageUrl(game.cover_url)}
            alt={game.name}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

      {/* Game Title - Minimal styling */}
      <div className="pt-2">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight">
          {game.name}
        </h3>
      </div>
    </div>
  );
});