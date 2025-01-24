"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Users, Gamepad2 } from "lucide-react";
import { Game } from "@/types/game";
import { BlurImage } from "./blur-image";
import { ensureAbsoluteUrl } from "@/lib/utils";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    cover?: {
      url: string;
    } | null;
    rating?: number;
    total_rating_count?: number;
  };
  onSelect?: (gameId: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const formatRating = (rating: number | null | undefined): string => {
  if (!rating || rating === 0) return "";
  return Math.round(rating).toString();
};

export function GameCard({ game, onSelect }: GameCardProps) {
  const coverUrl = game.cover?.url
    ? ensureAbsoluteUrl(game.cover.url.replace("t_thumb", "t_cover_big"))
    : null;
  const rating =
    typeof game.rating === "number" ? Math.round(game.rating) : undefined;

  return (
    <Link
      href={`/game/${game.id}`}
      className="group relative block w-full h-full overflow-hidden rounded-lg bg-gray-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
      onClick={() => onSelect?.(game.id)}
    >
      <div className="relative aspect-[3/4] w-full">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.name}
            fill
            priority
            className="object-cover transition-all duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            quality={90}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Gamepad2 className="h-10 w-10 text-gray-600" />
          </div>
        )}
      </div>

      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60" />

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

      {/* Game info container */}
      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
          {game.name}
        </h3>

        <div className="flex items-center gap-4 text-sm">
          {rating && (
            <div className="flex items-center text-yellow-300 font-medium">
              <Star className="h-4 w-4 mr-1.5 fill-current" />
              <span>{formatRating(rating)}</span>
            </div>
          )}
          {game.total_rating_count && game.total_rating_count > 0 && (
            <div className="flex items-center text-gray-200 font-medium">
              <Users className="h-4 w-4 mr-1.5" />
              <span>{formatNumber(game.total_rating_count)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

GameCard.displayName = "GameCard";
