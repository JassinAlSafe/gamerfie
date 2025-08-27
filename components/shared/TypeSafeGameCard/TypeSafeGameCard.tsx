import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Calendar, GamepadIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SafeGameAccess, Genre } from '@/types';

interface TypeSafeGameCardProps {
  game: SafeGameAccess;
  variant?: 'default' | 'compact' | 'wide';
  showGenres?: boolean;
  showRating?: boolean;
  showReleaseYear?: boolean;
  onClick?: (gameId: string) => void;
  className?: string;
  index?: number;
}

/**
 * TypeSafe GameCard - Inevitable pattern component that eliminates 'any' usage
 * All data is pre-processed and type-safe, making the component simple and reliable
 */
export function TypeSafeGameCard({
  game,
  variant = 'default',
  showGenres = true,
  showRating = true,
  showReleaseYear = true,
  onClick,
  className = '',
  index = 0
}: TypeSafeGameCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(game.id);
    } else {
      router.push(`/game/${game.id}`);
    }
  };

  // Inevitable pattern: Simple conditional rendering based on variant
  const getCardClasses = () => {
    const baseClasses = "bg-gray-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:bg-gray-900/40 backdrop-blur-sm";
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} max-w-sm`;
      case 'wide':
        return `${baseClasses} flex flex-row`;
      default:
        return baseClasses;
    }
  };

  const getImageClasses = () => {
    switch (variant) {
      case 'wide':
        return "relative w-24 h-32 flex-shrink-0";
      default:
        return "relative aspect-[3/4] w-full";
    }
  };

  const getContentClasses = () => {
    switch (variant) {
      case 'wide':
        return "p-3 flex-1";
      case 'compact':
        return "p-3";
      default:
        return "p-4";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={`${getCardClasses()} ${className}`}
      onClick={handleClick}
    >
      {/* Game Cover */}
      <div className={getImageClasses()}>
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            loading={index < 4 ? "eager" : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <GamepadIcon className="w-8 h-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className={getContentClasses()}>
        <h3 className={`font-semibold text-white mb-2 line-clamp-${variant === 'wide' ? '1' : '2'}`}>
          {game.name}
        </h3>

        {/* Metadata Row */}
        <div className="flex items-center justify-between mb-2">
          {showRating && game.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-yellow-400">
                {game.rating.toFixed(1)}
              </span>
            </div>
          )}

          {showReleaseYear && game.releaseYear && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-400">
                {game.releaseYear}
              </span>
            </div>
          )}
        </div>

        {/* Genres - Inevitable pattern: always an array, no undefined checks needed */}
        {showGenres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, variant === 'wide' ? 1 : 2).map((genre: Genre, index: number) => (
              <span
                key={genre.id || index}
                className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400"
              >
                {genre.name}
              </span>
            ))}
            {game.genres.length > (variant === 'wide' ? 1 : 2) && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                +{game.genres.length - (variant === 'wide' ? 1 : 2)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Grid wrapper for TypeSafe game cards - handles responsive layouts
 */
interface TypeSafeGameGridProps {
  games: SafeGameAccess[];
  variant?: 'default' | 'compact' | 'wide';
  showGenres?: boolean;
  showRating?: boolean;
  showReleaseYear?: boolean;
  onGameClick?: (gameId: string) => void;
  className?: string;
}

export function TypeSafeGameGrid({
  games,
  variant = 'default',
  showGenres = true,
  showRating = true,
  showReleaseYear = true,
  onGameClick,
  className = ''
}: TypeSafeGameGridProps) {
  const getGridClasses = () => {
    switch (variant) {
      case 'wide':
        return "space-y-4";
      case 'compact':
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
    }
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {games.map((game, index) => (
        <TypeSafeGameCard
          key={game.id}
          game={game}
          variant={variant}
          showGenres={showGenres}
          showRating={showRating}
          showReleaseYear={showReleaseYear}
          onClick={onGameClick}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for TypeSafe game cards
 */
export function TypeSafeGameCardSkeleton({ 
  variant = 'default',
  count = 8 
}: { 
  variant?: 'default' | 'compact' | 'wide';
  count?: number;
}) {
  const getSkeletonClasses = () => {
    switch (variant) {
      case 'wide':
        return "flex flex-row bg-gray-900/30 rounded-lg overflow-hidden animate-pulse";
      default:
        return "bg-gray-900/30 rounded-lg overflow-hidden animate-pulse";
    }
  };

  const getImageSkeletonClasses = () => {
    switch (variant) {
      case 'wide':
        return "w-24 h-32 bg-gray-800";
      default:
        return "aspect-[3/4] w-full bg-gray-800";
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={getSkeletonClasses()}>
          <div className={getImageSkeletonClasses()} />
          <div className="p-4 flex-1">
            <div className="h-4 bg-gray-800 rounded mb-2" />
            <div className="h-3 bg-gray-800 rounded w-3/4 mb-2" />
            <div className="flex gap-1">
              <div className="h-6 bg-gray-800 rounded-full w-16" />
              <div className="h-6 bg-gray-800 rounded-full w-12" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}