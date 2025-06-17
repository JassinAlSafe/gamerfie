"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlaylistGameCoverUrl } from "@/utils/playlist-image-utils";

interface Game {
  id: string;
  name: string;
  cover_url?: string | null;
  background_image?: string | null;
  cover?: { id: string; url: string } | string;
}

interface GameThumbnailProps {
  game: Game;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSourceIndicator?: boolean;
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  xs: { width: 24, height: 32, className: "w-6 h-8" },
  sm: { width: 32, height: 40, className: "w-8 h-10" },
  md: { width: 48, height: 64, className: "w-12 h-16" },
  lg: { width: 64, height: 80, className: "w-16 h-20" },
};

export const GameThumbnail: React.FC<GameThumbnailProps> = ({
  game,
  size = 'sm',
  showSourceIndicator = false,
  className,
  priority = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const config = sizeConfig[size];
  const imageUrl = getPlaylistGameCoverUrl(game);
  
  const getSourceIndicator = () => {
    if (!showSourceIndicator) return null;
    
    const source = game.id.startsWith('igdb_') ? 'igdb' : 'rawg';
    return (
      <div className={cn(
        "absolute -top-1 -right-1 w-2 h-2 rounded-full",
        source === 'igdb' ? 'bg-blue-500' : 'bg-green-500'
      )} />
    );
  };

  if (!imageUrl || imageError) {
    return (
      <div className={cn(
        config.className,
        "bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded border border-background shadow-sm overflow-hidden relative",
        className
      )}>
        <Gamepad2 className="w-1/2 h-1/2 text-gray-400" />
        {getSourceIndicator()}
      </div>
    );
  }

  return (
    <div className={cn(
      config.className,
      "relative rounded border border-background shadow-sm overflow-hidden",
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-1/3 w-1/3 border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={game.name}
        fill
        className={cn(
          "object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        sizes={`${config.width}px`}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      {getSourceIndicator()}
    </div>
  );
};

// Utility component for rendering multiple game thumbnails
interface GameThumbnailStackProps {
  games: Game[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const GameThumbnailStack: React.FC<GameThumbnailStackProps> = ({
  games,
  maxVisible = 3,
  size = 'sm',
  showCount = true,
  className,
}) => {
  const visibleGames = games.slice(0, maxVisible);
  const remainingCount = Math.max(0, games.length - maxVisible);
  const config = sizeConfig[size];

  return (
    <div className={cn("flex -space-x-1", className)}>
      {visibleGames.map((game, index) => (
        <div key={game.id} style={{ zIndex: maxVisible - index }}>
          <GameThumbnail
            game={game}
            size={size}
          />
        </div>
      ))}
      {showCount && remainingCount > 0 && (
        <div 
          className={cn(
            config.className,
            "bg-muted border border-background rounded flex items-center justify-center"
          )}
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};