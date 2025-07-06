"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Game } from "@/types";
import { getCoverImageUrl } from "@/utils/image-utils";

interface GameCoverProps {
  game: Game;
  onLoad?: () => void;
}

export function GameCover({ game, onLoad }: GameCoverProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const coverUrl = game.cover_url || (game as any).coverImage;

  if (!coverUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="w-32 sm:w-48 md:w-64 lg:w-72 flex-shrink-0"
      >
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-gray-800/80 border border-gray-700/30" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="w-32 sm:w-48 md:w-64 lg:w-72 flex-shrink-0"
    >
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-xl ring-1 ring-gray-700/30">
        {/* Shimmer effect while loading */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 bg-[length:200%_100%] animate-shimmer transition-opacity duration-300 ${
            isLoading || !mounted ? "opacity-100" : "opacity-0"
          }`}
        />

        {mounted && (
          <Image
            src={getCoverImageUrl(coverUrl)}
            alt={game.name}
            fill
            priority
            sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, (max-width: 1024px) 256px, 288px"
            className={`object-cover transition-all duration-500 ${
              isLoading
                ? "scale-110 blur-sm opacity-0"
                : "scale-100 blur-0 opacity-100"
            }`}
            onLoad={() => {
              setIsLoading(false);
              onLoad?.();
            }}
          />
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}
