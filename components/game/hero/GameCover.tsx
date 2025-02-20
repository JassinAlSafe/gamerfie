"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Game } from "@/types/game";
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

  const coverUrl = game.cover_url || game.coverImage;

  if (!coverUrl) {
    return (
      <motion.div
        initial={false}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="w-48 md:w-1/5 flex-shrink-0 -ml-8 md:-ml-16"
      >
        <div className="relative w-48 h-64 md:w-64 md:h-80 rounded-lg overflow-hidden shadow-lg bg-gray-800" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={mounted ? { opacity: 1 } : { opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="w-48 md:w-1/5 flex-shrink-0 -ml-8 md:-ml-16"
    >
      <div className="relative w-48 h-64 md:w-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
        <div
          className={`absolute inset-0 bg-gray-800 transition-opacity duration-300 ${
            isLoading || !mounted ? "opacity-100" : "opacity-0"
          }`}
        />
        {mounted && (
          <Image
            src={getCoverImageUrl(coverUrl)}
            alt={game.name}
            fill
            priority
            quality={100}
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            unoptimized
            onLoad={() => {
              setIsLoading(false);
              onLoad?.();
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
