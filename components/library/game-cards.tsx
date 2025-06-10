"use client";

import { Game } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function GridGameCard({ game }: { game: Game }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative"
    >
      <Link href={`/game/${game.id}`}>
        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-900 relative">
          {game.cover && (
            <Image
              src={game.cover.url}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-semibold text-white">{game.name}</h3>
            <div className="flex items-center space-x-3 mt-2">
              {game.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-white">{game.rating.toFixed(1)}</span>
                </div>
              )}
              {game.playTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-sm text-white">{game.playTime}h</span>
                </div>
              )}
            </div>
          </div>
          {game.completed && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function ListGameCard({ game }: { game: Game }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Link href={`/game/${game.id}`}>
        <div className="bg-gray-900/50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-900/70 transition-colors">
          {game.cover && (
            <div className="relative w-16 h-24 flex-shrink-0">
              <Image
                src={game.cover.url}
                alt={game.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{game.name}</h3>
              {game.completed && (
                <Trophy className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              {game.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{game.rating.toFixed(1)}</span>
                </div>
              )}
              {game.playTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-sm">{game.playTime}h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 