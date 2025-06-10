"use client";

import React from "react";
import { motion } from "framer-motion";
import { Game, GameProgress } from "../../../types/game";
import { Profile } from "@/types/profile";
import { GameLibraryActions } from "@/components/game/GameLibraryActions";

interface GameActionButtonsProps {
  game: Game;
  profile?: Profile | null;
  progress?: Partial<GameProgress>;
}

export function GameActionButtons({ game }: GameActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex flex-wrap gap-3 justify-center md:justify-start pt-4"
    >
      <GameLibraryActions
        gameId={game.id.toString()}
        gameName={game.name}
        cover={game.cover?.url}
        rating={game.total_rating || undefined}
        releaseDate={game.first_release_date || undefined}
        platforms={game.platforms?.map(p => ({ 
          id: typeof p.id === 'string' ? parseInt(p.id) : p.id, 
          name: p.name 
        })) || []}
        genres={game.genres?.map(g => ({ 
          id: typeof g.id === 'string' ? parseInt(g.id) : g.id, 
          name: g.name 
        })) || []}
      />
    </motion.div>
  );
}
