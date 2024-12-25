"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProcessedGame, GameStatus } from "@/types/game";

interface GameCardProps {
  game: ProcessedGame;
  view?: "grid" | "list";
  onStatusChange?: (status: GameStatus) => void;
}

export function GameCard({
  game,
  view = "grid",
  onStatusChange,
}: GameCardProps) {
  // Transform IGDB cover URL to get the highest quality version
  const baseImageUrl =
    game.cover?.url || game.cover_url || "/images/placeholder-game.jpg";
  const imageUrl = baseImageUrl.replace("/t_thumb/", "/t_cover_big/");
  const statusOptions: GameStatus[] = [
    "playing",
    "completed",
    "want_to_play",
    "dropped",
  ];

  if (view === "list") {
    return (
      <div className="group flex items-center bg-gray-900/40 hover:bg-gray-900/60 transition-all duration-200 overflow-hidden rounded-lg">
        {/* Cover image - using game cover aspect ratio (3:4) */}
        <div className="relative w-[84px] h-[112px] flex-shrink-0">
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            sizes="84px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            quality={100}
            priority
          />
        </div>

        <div className="flex flex-1 items-center justify-between px-4 py-3">
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-medium text-white truncate pr-4">
              {game.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {game.status && (
                <Badge variant="secondary" className="text-xs bg-gray-800/50">
                  {game.status.charAt(0).toUpperCase() +
                    game.status.slice(1).replace("_", " ")}
                </Badge>
              )}
              {game.first_release_date && (
                <span className="text-xs text-gray-400">
                  {new Date(game.first_release_date * 1000).getFullYear()}
                </span>
              )}
            </div>
          </div>

          {onStatusChange && (
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(status)}
                      className="text-sm"
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("_", " ")}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Enhanced Grid View
  return (
    <div className="group relative bg-gray-900/40 rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl">
      {/* Main Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageUrl}
          alt={game.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          quality={100}
          priority
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge - Top Right */}
        {game.status && (
          <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10">
            {game.status.charAt(0).toUpperCase() +
              game.status.slice(1).replace("_", " ")}
          </div>
        )}

        {/* Game Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white truncate mb-2">
            {game.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {game.first_release_date && (
                <span className="text-sm text-gray-300/90">
                  {new Date(game.first_release_date * 1000).getFullYear()}
                </span>
              )}
              {game.playTime && (
                <div className="flex items-center gap-1 text-sm text-gray-300/90">
                  <Clock className="w-4 h-4" />
                  <span>{game.playTime}h</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {onStatusChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-none px-3"
                  >
                    <span className="mr-2">Status</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[160px] bg-gray-900/95 border border-white/10 backdrop-blur-sm"
                >
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(status)}
                      className="text-sm text-gray-100 focus:text-white focus:bg-white/10 cursor-pointer"
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("_", " ")}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
