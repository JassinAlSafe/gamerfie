import React, { memo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star, Users, Gamepad2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureAbsoluteUrl } from '@/lib/utils';
import { useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Types moved to types/game.ts
import { Game, GameCategories } from '@/types/game';

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const GameCard = memo(({ game, index }: { game: Game; index: number }) => (
  <Link href={`/game/${game.id}`} className="flex-shrink-0 w-[160px]">
    <motion.div
      className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg cursor-pointer border border-white/5"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {game.cover?.url ? (
        <Image
          src={ensureAbsoluteUrl(game.cover.url) || ''}
          alt={game.name}
          fill
          sizes="160px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          priority={index < 4}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-gray-600" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-xs font-semibold text-white line-clamp-2 mb-1">{game.name}</h3>
        <div className="flex items-center gap-2 text-xs">
          {game.rating && (
            <div className="flex items-center text-yellow-400">
              <Star className="w-3 h-3 mr-0.5 fill-current" />
              <span>{Math.round(game.rating)}</span>
            </div>
          )}
          {game.total_rating_count && game.total_rating_count > 0 && (
            <div className="flex items-center text-gray-400">
              <Users className="w-3 h-3 mr-0.5" />
              <span>{formatNumber(game.total_rating_count)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </Link>
));

GameCard.displayName = 'GameCard';

const GameCarousel = memo(({ games }: { games: Game[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative group">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
        
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={!scrollContainerRef.current?.scrollLeft}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

GameCarousel.displayName = 'GameCarousel';

const CategorySkeleton = memo(() => (
  <div className="mb-12">
    <div className="h-8 w-48 bg-gray-800/50 rounded mb-4" />
    <div className="flex gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4]">
          <Card className="w-full h-full animate-pulse bg-gray-800/50" />
        </div>
      ))}
    </div>
  </div>
));

CategorySkeleton.displayName = 'CategorySkeleton';

const ErrorDisplay = memo(({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <AlertCircle className="w-12 h-12 mb-4" />
    <p className="mb-4 text-center max-w-md">{message}</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="text-gray-400 hover:text-white"
    >
      Try Again
    </Button>
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
      <p className="text-red-400">Something went wrong:</p>
      <pre className="text-sm text-red-300">{error.message}</pre>
      <Button onClick={resetErrorBoundary} className="mt-4">Try again</Button>
    </div>
  );
}

const PopularGamesSection: React.FC<{ category?: 'popular' | 'upcoming' | 'new' }> = memo(({ category = 'popular' }) => {
  const { data: categories, isLoading, error, refetch } = useQuery<GameCategories>({
    queryKey: ['popularGames', category],
    queryFn: async () => {
      try {
        const response = await fetch('/api/games/popular');
        if (!response.ok) {
          throw new Error('Failed to fetch popular games');
        }
        const data = await response.json();
        return {
          topRated: data.topRated || [],
          newReleases: data.newReleases || [],
          upcoming: data.upcoming || [],
          trending: data.trending || []
        };
      } catch (error) {
        console.error('Error fetching popular games:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (error) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ErrorDisplay 
          message={error instanceof Error ? error.message : 'Failed to load games'} 
          onRetry={() => refetch()}
        />
      </ErrorBoundary>
    );
  }

  if (!categories) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No games found at the moment.</p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="mt-4"
        >
          Refresh
        </Button>
      </div>
    );
  }

  const getCategoryGames = () => {
    switch (category) {
      case 'upcoming':
        return categories.upcoming;
      case 'new':
        return categories.newReleases;
      case 'popular':
      default:
        return categories.topRated;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GameCarousel games={getCategoryGames()} />
    </ErrorBoundary>
  );
});

PopularGamesSection.displayName = 'PopularGamesSection';

export default PopularGamesSection;