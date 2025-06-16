"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Clock, CalendarDays, ArrowRight, Gamepad2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Game } from "@/types";
import { Button } from "@/components/ui/button";
import { getCoverImageUrl } from "@/utils/image-utils";
import { getValidYear } from "@/utils/format-utils";
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
  priority, 
  showActions 
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

  const renderMetrics = () => {
    const metrics = [];

    if (game.rating && game.rating > 0) {
      metrics.push(
        <div key="rating" className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3 h-3 fill-yellow-400" />
          <span className="text-xs font-medium">{game.rating.toFixed(1)}</span>
        </div>
      );
    }

    if ((game as any).total_rating_count) {
      metrics.push(
        <div key="votes" className="flex items-center gap-1 text-gray-400">
          <Users className="w-3 h-3" />
          <span className="text-xs">
            {(game as any).total_rating_count > 1000
              ? `${((game as any).total_rating_count / 1000).toFixed(1)}k`
              : (game as any).total_rating_count}
          </span>
        </div>
      );
    }

    if ((game as any).playTime) {
      metrics.push(
        <div key="playtime" className="flex items-center gap-1 text-blue-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{(game as any).playTime}h</span>
        </div>
      );
    }

    return metrics.slice(0, variant === 'list' ? 3 : 2);
  };

  const renderImage = () => (
    <div className={cn(
      "relative overflow-hidden",
      variant === 'list' ? "w-16 h-24 flex-shrink-0 rounded-md" : "aspect-[3/4] w-full"
    )}>
      {coverUrl && !imageError ? (
        <>
          <Image
            src={coverUrl}
            alt={title}
            fill
            priority={priority}
            sizes={
              variant === 'list' 
                ? "64px"
                : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            }
            className={cn(
              "object-cover transition-all duration-500",
              isLoading ? "scale-110 blur-2xl" : "scale-100 blur-0",
              variant !== 'list' && "group-hover:scale-105"
            )}
            quality={variant === 'list' ? 60 : 80}
            onLoad={() => setLoading(false)}
            onError={() => setImageError(true)}
          />
          {variant !== 'list' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <Gamepad2 className={cn(
            "text-gray-600",
            variant === 'list' ? "w-8 h-8" : "w-16 h-16"
          )} />
        </div>
      )}
    </div>
  );

  const renderInfo = () => (
    <div className={cn(
      variant === 'list' 
        ? "flex-grow" 
        : variant === 'showcase'
        ? "absolute inset-x-0 bottom-0 p-4"
        : "absolute bottom-0 left-0 right-0 p-4"
    )}>
      <div className={cn(
        variant === 'list' && "flex items-center justify-between"
      )}>
        <h3 className={cn(
          "font-semibold text-white mb-1",
          variant === 'list' ? "text-lg" : "line-clamp-1",
          variant !== 'list' && "group-hover:text-purple-300 transition-colors duration-300"
        )}>
          {title}
        </h3>
        
        {(game as any).completed && (
          <div className={cn(
            variant === 'list' ? "" : "absolute top-2 right-2",
            "bg-green-500 rounded-full p-1"
          )}>
            <Trophy className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className={cn(
        "flex items-center",
        variant === 'list' ? "space-x-4 mt-2" : "justify-between"
      )}>
        {variant !== 'showcase' && game.first_release_date && (
          <p className="text-sm text-white/60 mb-2">
            {game.platforms && game.platforms.length > 0
              ? game.platforms[0].name
              : "Coming Soon"}
          </p>
        )}
        
        {variant !== 'showcase' && game.first_release_date && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs">
            <CalendarDays className="w-3 h-3" />
            {new Date(game.first_release_date * 1000).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "short" }
            )}
          </div>
        )}

        {variant !== 'showcase' && getValidYear(game.first_release_date) && (
          <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
            {getValidYear(game.first_release_date)}
          </p>
        )}

        <div className="flex items-center gap-2">
          {renderMetrics()}
        </div>
      </div>

      {showActions && variant === 'showcase' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
          <Button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (variant === 'list') {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-900/70 transition-colors">
        {renderImage()}
        {renderInfo()}
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative rounded-lg overflow-hidden border border-white/5",
      variant === 'showcase' ? "aspect-[3/4]" : "min-h-[320px] flex flex-col bg-gradient-to-b from-gray-900/90 to-gray-950"
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
        className={cn(
          "block w-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50",
          variant !== 'list' && "hover:ring-purple-500/20 hover:ring-2 hover:shadow-purple-500/10 shadow-lg ring-1 ring-gray-800/10 rounded-xl",
          variant === 'showcase' && "isolate"
        )}
        aria-label={`View details for ${game.name}`}
      >
        <GameCardContent game={game} variant={variant} {...props} />
      </Link>
    </CardWrapper>
  );
}));

GameCard.displayName = "GameCard";