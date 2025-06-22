import React from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface GameDetails {
  name: string;
  developer?: string;
  release_date?: string;
  genres?: string[];
  cover_url?: string;
}

interface GameInfoSectionProps {
  gameDetails: GameDetails;
  gameId: string;
  rating: number;
}

export function GameInfoSection({ gameDetails, gameId, rating }: GameInfoSectionProps) {
  const coverUrl = gameDetails.cover_url?.replace("t_thumb", "t_cover_big");
  const isDataMissing = gameDetails.genres?.includes("Game Data Missing") || 
                       gameDetails.developer === "Data unavailable";

  return (
    <div className="flex gap-4 mb-4">
      {/* Game Cover */}
      <div className="w-20 h-28 flex-shrink-0 relative">
        <div className={`w-full h-full rounded-lg overflow-hidden shadow-lg relative ${
          isDataMissing ? 'bg-slate-800/50 border border-amber-500/20' : 'bg-slate-800'
        }`}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Cover for ${gameDetails.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className={`w-6 h-6 ${isDataMissing ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-white text-black font-bold text-xs px-2 py-1 rounded-md shadow-md">
            {rating}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/game/${gameId}`}
          className="text-lg font-bold text-white hover:text-slate-300 transition-colors line-clamp-2 block leading-tight mb-2"
        >
          {gameDetails.name}
        </Link>

        {gameDetails.developer && (
          <div className="text-sm text-slate-400 mb-3">
            <span className="font-medium text-slate-300">
              {gameDetails.developer}
            </span>
            {gameDetails.release_date && (
              <>
                <span className="mx-1.5 text-slate-500">•</span>
                <span>
                  {new Date(gameDetails.release_date).getFullYear()}
                </span>
              </>
            )}
          </div>
        )}

        {/* Clean rating display */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-white">
            ★ {rating}/5
          </span>
        </div>

        {/* Genre tags */}
        {gameDetails.genres && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {gameDetails.genres
              .slice(0, 3)
              .map((genre, index) => (
                <Badge
                  key={`genre-${index}`}
                  variant="outline"
                  className={`text-xs px-2 py-0.5 h-5 ${
                    genre === "Game Data Missing" 
                      ? "border-amber-500/50 text-amber-300 bg-amber-900/20"
                      : "border-slate-600/50 text-slate-300 bg-slate-800/30"
                  }`}
                >
                  {genre}
                </Badge>
              ))}
            {gameDetails.genres.length > 3 && !gameDetails.genres.includes("Game Data Missing") && (
              <Badge
                variant="outline"
                className="text-xs border-slate-700/50 text-slate-400 bg-slate-900/30 px-2 py-0.5 h-5"
              >
                +{gameDetails.genres.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}