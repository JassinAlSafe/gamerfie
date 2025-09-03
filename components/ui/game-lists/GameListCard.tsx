"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getCoverImageUrl } from "@/utils/image-utils";
import { GameListItem } from "@/types/gamelist/game-list";
import { Clock, GamepadIcon } from "lucide-react";

export interface GameListCardProps {
  id: string;
  title: string;
  content?: string | null;
  games: GameListItem[];
  updatedAt?: string;
  onClick: (listId: string) => void;
  index: number;
  variant?: "default" | "compact";
}

export const GameListCard = memo<GameListCardProps>(function GameListCard({
  id,
  title,
  content,
  games,
  updatedAt,
  onClick,
  index,
  variant = "default"
}) {
  const gameCount = games?.length || 0;
  const hasDescription = content && !content.startsWith("[");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card
        className="group relative bg-gray-900/30 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer border-gray-700/30 hover:border-gray-600/50 overflow-hidden"
        onClick={() => onClick(id)}
      >
        <CardContent className={variant === "compact" ? "p-4" : "p-6"}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-white group-hover:text-purple-300 transition-colors truncate ${
                variant === "compact" ? "text-lg" : "text-xl"
              }`}>
                {title}
              </h3>
              {updatedAt && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400">
                    Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/25 px-3 py-1.5 rounded-full ml-3 shadow-sm">
              <GamepadIcon className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-xs font-semibold text-purple-300">
                {gameCount} {gameCount === 1 ? "game" : "games"}
              </span>
            </div>
          </div>

          {/* Description */}
          {hasDescription && variant !== "compact" && (
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">
              {content}
            </p>
          )}

          {/* Game Covers Grid */}
          {gameCount > 0 ? (
            <div className={`grid gap-2 ${
              variant === "compact" ? "grid-cols-3" : "grid-cols-4"
            }`}>
              {games.slice(0, variant === "compact" ? 3 : 4).map((game, gameIndex) => (
                <GameCoverPreview
                  key={game.id}
                  game={game}
                  index={gameIndex}
                  size={variant === "compact" ? "sm" : "md"}
                />
              ))}
              
              {/* Show more indicator */}
              {gameCount > (variant === "compact" ? 3 : 4) && (
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xs font-medium text-gray-300">
                      +{gameCount - (variant === "compact" ? 3 : 4)}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">more</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-700/50 rounded-lg">
              <div className="text-center">
                <GamepadIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No games added yet</p>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
});

interface GameCoverPreviewProps {
  game: GameListItem;
  index: number;
  size?: "sm" | "md";
}

const GameCoverPreview = memo<GameCoverPreviewProps>(function GameCoverPreview({
  game,
  index,
  size = "md"
}) {
  const aspectRatio = "aspect-[3/4]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`relative ${aspectRatio} rounded-md overflow-hidden group/cover`}
    >
      {game.cover_url ? (
        <Image
          src={getCoverImageUrl(game.cover_url)}
          alt={game.name}
          fill
          className="object-cover transition-transform group-hover/cover:scale-110"
          sizes={size === "sm" ? "60px" : "80px"}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
          <span className="text-xs text-gray-400">No Cover</span>
        </div>
      )}
      
      {/* Game name tooltip on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white text-xs p-1 opacity-0 group-hover/cover:opacity-100 transition-opacity">
        <p className="truncate">{game.name}</p>
      </div>
    </motion.div>
  );
});