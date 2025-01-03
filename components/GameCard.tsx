"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Game } from "@/types/game";
import { getCoverImageUrl } from "@/utils/image-utils";

export default function GameCard({
  game,
  index,
  inView,
}: {
  game: Game;
  index: number;
  inView: boolean;
}) {
  const [isLoading, setLoading] = useState(true);
  const coverUrl = game.cover?.url
    ? getCoverImageUrl(game.cover.url)
    : "/placeholder.png";

  return (
    <Link
      href={`/game/${game.id}`}
      className="group relative block w-full h-full overflow-hidden rounded-lg bg-gray-900/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={coverUrl}
          alt={game.name}
          fill
          priority={index < 4}
          className={`
            object-cover transition-all duration-300
            ${isLoading ? "scale-110 blur-xl" : "scale-100 blur-0"}
          `}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          quality={90}
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
          {game.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          {game.total_rating ? (
            <>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{Math.round(game.total_rating)}</span>
            </>
          ) : null}
          {game.total_rating_count ? (
            <>
              <Users className="w-4 h-4 text-blue-500" />
              <span>{game.total_rating_count}</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
