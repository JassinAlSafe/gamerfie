import React from "react";
import { Badge } from "@/components/ui/badge";

interface GameCoverSectionProps {
  game_details?: {
    name: string;
    cover_url?: string;
    genres?: string[];
  };
  rating: number;
}

export function GameCoverSection({
  game_details,
  rating,
}: GameCoverSectionProps) {
  return (
    <div className="lg:w-64 flex-shrink-0 relative">
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {game_details?.cover_url ? (
          <img
            src={game_details.cover_url.replace("t_thumb", "t_cover_big")}
            alt={`Cover for ${game_details.name}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-medium">No Cover</p>
            </div>
          </div>
        )}

        {/* Enhanced overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Rating badge with glow effect */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-lg"></div>
            <div className="relative bg-black/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 border border-yellow-400/20">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-600"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-white">{rating}/5</span>
            </div>
          </div>
        </div>

        {/* Enhanced genre tags */}
        {game_details?.genres && game_details.genres.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap gap-2">
              {game_details.genres.slice(0, 2).map((genre) => (
                <Badge
                  key={genre}
                  className="text-xs bg-black/80 backdrop-blur-sm border border-gray-600/50 text-gray-200 hover:bg-black/90 transition-colors"
                >
                  {genre}
                </Badge>
              ))}
              {game_details.genres.length > 2 && (
                <Badge className="text-xs bg-black/80 backdrop-blur-sm border border-gray-600/50 text-gray-400">
                  +{game_details.genres.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
