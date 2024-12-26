"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Gamepad2 } from "lucide-react";
import { Game } from "@/types/game";
import { formatRating, formatDate } from "@/utils/format-utils";

interface GameQuickStatsProps {
  game: Game;
}

export function GameQuickStats({ game }: GameQuickStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap gap-4 justify-center md:justify-start"
    >
      {game.total_rating && (
        <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-400 rounded-full px-6 py-2.5 backdrop-blur-sm border border-yellow-400/20 transition-colors duration-200 hover:bg-yellow-400/20">
          <Star className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {formatRating(game.total_rating)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 bg-blue-400/10 text-blue-400 rounded-full px-6 py-2.5 backdrop-blur-sm border border-blue-400/20 transition-colors duration-200 hover:bg-blue-400/20">
        <Calendar className="w-5 h-5 mr-2" />
        <span className="text-lg">
          {game.first_release_date
            ? formatDate(game.first_release_date)
            : "Unknown"}
        </span>
      </div>

      {game.genres?.[0] && (
        <div className="flex items-center gap-2 bg-purple-400/10 text-purple-400 rounded-full px-6 py-2.5 backdrop-blur-sm border border-purple-400/20 transition-colors duration-200 hover:bg-purple-400/20">
          <Gamepad2 className="w-5 h-5 mr-2" />
          <span className="text-lg">{game.genres[0].name}</span>
        </div>
      )}
    </motion.div>
  );
}
