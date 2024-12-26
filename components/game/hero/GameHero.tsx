"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Game } from "@/types/game";
import { Profile } from "@/types/profile";
import { GameProgress } from "@/types/game";
import { BackButton } from "@/components/BackButton";
import { GameCover } from "./GameCover";
import { GameQuickStats } from "./GameQuickStats";
import { GameLibraryActions } from "@/components/game/GameLibraryActions";
import { getHighQualityImageUrl } from "@/utils/image-utils";
import { AddToLibraryButton } from "@/components/add-to-library-button";
import { UpdateProgressButton } from "@/components/update-progress-button";

interface GameHeroProps {
  game: Game;
  profile?: Profile | null;
  progress?: {
    playTime?: number | null;
    completionPercentage?: number | null;
    achievementsCompleted?: number | null;
  };
}

export function GameHero({ game, profile, progress }: GameHeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const backgroundImage = game.artworks?.[0]?.url || game.screenshots?.[0]?.url;

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      {backgroundImage && mounted && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 filter blur-[2px] transition-opacity duration-500 ${
            isImageLoaded ? "opacity-70" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${getHighQualityImageUrl(backgroundImage)})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 to-gray-950/90" />

      {/* Hero Content */}
      <div className="relative z-30 h-full container mx-auto px-8 md:px-12 flex flex-col">
        <div className="pt-8">
          <BackButton />
        </div>

        {/* Game Info Container */}
        <div className="flex-grow flex items-end pb-16">
          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-end w-full"
          >
            <GameCover game={game} onLoad={() => setIsImageLoaded(true)} />

            {/* Game Details */}
            <div className="md:w-4/5 text-center md:text-left space-y-6">
              <motion.h1
                initial={false}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
              >
                {game.name}
              </motion.h1>

              <GameQuickStats game={game} />

              <motion.p
                initial={false}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-gray-300/90 leading-relaxed line-clamp-3 max-w-3xl"
              >
                {game.summary}
              </motion.p>

              <motion.div
                initial={false}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <AddToLibraryButton
                  gameId={game.id.toString()}
                  gameName={game.name}
                  cover={game.cover?.url}
                  rating={game.total_rating || undefined}
                  releaseDate={game.first_release_date || undefined}
                  platforms={game.platforms || []}
                  genres={game.genres || []}
                />
                <UpdateProgressButton
                  gameId={game.id.toString()}
                  gameName={game.name}
                  game={game}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
