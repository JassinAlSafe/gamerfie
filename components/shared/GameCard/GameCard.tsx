"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Gamepad2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Game } from "@/types";
import { getCoverImageUrl } from "@/utils/image-utils";
import { getImageConfig, getOptimizedCoverUrl, handleImageError } from "@/utils/image-optimization";
import { cn } from "@/lib/utils";

type CategoryOption =
  | "all"
  | "popular"
  | "trending"
  | "upcoming"
  | "recent"
  | "classic";

export type GameCardVariant = "grid" | "list" | "carousel" | "showcase";

interface GameCardProps {
  game: Game;
  variant?: GameCardVariant;
  index?: number;
  category?: CategoryOption;
  priority?: boolean;
  className?: string;
  showActions?: boolean;
  animated?: boolean;
}

const GameCardContent = memo(({ 
  game, 
  variant, 
  index,
  priority, 
  showActions: _showActions 
}: Omit<GameCardProps, 'className' | 'animated'>) => {
  const [isLoading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Unified cover URL logic
  const coverUrl = (() => {
    if (imageError) return "/placeholder.png";
    
    // Handle different cover URL formats
    const rawUrl = 
      (game as any).coverImage ||
      game.cover_url ||
      (game.cover && typeof game.cover === "object" ? game.cover.url : undefined);
    
    if (!rawUrl) return "/placeholder.png";
    if (rawUrl.startsWith("https://")) return rawUrl;
    
    return getCoverImageUrl(rawUrl);
  })();

  const title = game.title || game.name || "Untitled Game";

  const renderRating = () => {
    if (!game.rating || game.rating <= 0) return null;
    
    return (
      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs font-medium text-white">{game.rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderImage = () => {
    const imageConfig = getImageConfig(
      variant === 'list' ? 'listView' : 'gameCard',
      { priority },
      index
    );
    const optimizedUrl = getOptimizedCoverUrl(coverUrl, 'cover_big');

    return (
      <div className={cn(
        "relative overflow-hidden",
        variant === 'list' ? "w-20 h-28 flex-shrink-0 rounded-md" : "aspect-[3/4] w-full"
      )}>
        {optimizedUrl && !imageError ? (
          <>
            <Image
              src={optimizedUrl}
              alt={title}
              fill
              priority={imageConfig.priority}
              sizes={imageConfig.sizes}
              quality={imageConfig.quality}
              loading={imageConfig.loading}
              className={cn(
                "object-cover transition-all duration-300",
                isLoading ? "scale-100 opacity-0" : "scale-100 opacity-100",
                variant !== 'list' && "group-hover:scale-105"
              )}
              onLoad={() => setLoading(false)}
              onError={(e) => {
                setImageError(true);
                handleImageError(e, coverUrl);
              }}
              unoptimized={false}
          />
          {variant !== 'list' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          )}
          {variant !== 'list' && renderRating()}
        </>
      ) : (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <Gamepad2 className={cn(
            "text-gray-600",
            variant === 'list' ? "w-10 h-10" : "w-16 h-16"
          )} />
        </div>
      )}
    </div>
    );
  };

  const renderInfo = () => {
    if (variant === 'list') {
      return (
        <div className="flex-grow flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-base line-clamp-1">
              {title}
            </h3>
            {game.rating && game.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-400 mt-1">
                <Star className="w-3 h-3 fill-yellow-400" />
                <span className="text-xs font-medium">{game.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {(game as any).completed && (
            <div className="bg-green-500 rounded-full p-1">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-white line-clamp-2 text-sm group-hover:text-purple-300 transition-colors duration-300">
          {title}
        </h3>
        {(game as any).completed && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  if (variant === 'list') {
    return (
      <div className="bg-gray-900/50 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-900/70 transition-colors">
        {renderImage()}
        {renderInfo()}
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800/50",
      "hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10",
      variant === 'showcase' ? "aspect-[3/4]" : "aspect-[3/4]"
    )}>
      {renderImage()}
      {renderInfo()}
    </div>
  );
});

GameCardContent.displayName = "GameCardContent";

export const GameCard = memo(React.forwardRef<HTMLDivElement, GameCardProps>(({ 
  game, 
  variant = "grid", 
  className, 
  animated = false, 
  ...props 
}, ref) => {
  const CardWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    layout: true,
    initial: { opacity: 0, y: variant === 'list' ? 0 : 20, x: variant === 'list' ? -20 : 0 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit: { opacity: 0, y: variant === 'list' ? 0 : -20, x: variant === 'list' ? 20 : 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <CardWrapper ref={ref} className={cn("group", className)} {...animationProps}>
      <Link
        href={`/game/${game.id}`}
        className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl"
        aria-label={`View details for ${game.name}`}
      >
        <GameCardContent game={game} variant={variant} {...props} />
      </Link>
    </CardWrapper>
  );
}));

GameCard.displayName = "GameCard";