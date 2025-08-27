import { GameApiResponse, SafeGameAccess, Genre, GameCover } from '@/types';
import { getCoverImageUrl } from './image-utils';
import { formatRating, getValidYear } from './format-utils';

/**
 * Type guards for safe data access - inevitable patterns that eliminate 'any'
 */

// Type guard for checking if a value has a cover property
export function hasCover(game: unknown): game is { cover: GameCover | string } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'cover' in game &&
    game.cover !== null &&
    game.cover !== undefined
  );
}

// Type guard for checking if a value has a cover_url property
export function hasCoverUrl(game: unknown): game is { cover_url: string | null } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'cover_url' in game
  );
}

// Type guard for checking if a value has a rating property
export function hasRating(game: unknown): game is { rating: number } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'rating' in game &&
    typeof game.rating === 'number'
  );
}

// Type guard for checking if a value has a total_rating property
export function hasTotalRating(game: unknown): game is { total_rating: number } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'total_rating' in game &&
    typeof game.total_rating === 'number'
  );
}

// Type guard for checking if a value has a first_release_date property
export function hasReleaseDate(game: unknown): game is { first_release_date: number } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'first_release_date' in game &&
    typeof game.first_release_date === 'number'
  );
}

// Type guard for checking if a value has genres
export function hasGenres(game: unknown): game is { genres: Genre[] } {
  return (
    typeof game === 'object' &&
    game !== null &&
    'genres' in game &&
    Array.isArray(game.genres)
  );
}

/**
 * Inevitable utility functions - natural JavaScript patterns for game data access
 */

// Get cover URL from any game-like object - handles all possible formats
export function getGameCoverUrl(game: GameApiResponse): string | null {
  // Handle string cover (direct URL)
  if (hasCover(game) && typeof game.cover === 'string') {
    return getCoverImageUrl(game.cover);
  }
  
  // Handle GameCover object
  if (hasCover(game) && typeof game.cover === 'object' && game.cover.url) {
    return getCoverImageUrl(game.cover.url);
  }
  
  // Handle cover_url property
  if (hasCoverUrl(game) && game.cover_url) {
    return getCoverImageUrl(game.cover_url);
  }
  
  return null;
}

// Get rating from any game-like object - handles multiple rating formats
export function getGameRating(game: GameApiResponse): number | null {
  if (hasRating(game) && game.rating > 0) {
    return game.rating;
  }
  
  if (hasTotalRating(game) && game.total_rating > 0) {
    return game.total_rating;
  }
  
  return null;
}

// Get formatted rating string - inevitable pattern for display
export function getGameRatingDisplay(game: GameApiResponse): string | null {
  const rating = getGameRating(game);
  return rating ? formatRating(rating) : null;
}

// Get release year from any game-like object
export function getGameReleaseYear(game: GameApiResponse): number | null {
  if (hasReleaseDate(game)) {
    return getValidYear(game.first_release_date);
  }
  return null;
}

// Get genres array - always returns an array (never undefined)
export function getGameGenres(game: GameApiResponse): Genre[] {
  if (hasGenres(game)) {
    return game.genres;
  }
  return [];
}

// Convert any game-like object to SafeGameAccess - inevitable pattern
export function toSafeGameAccess(game: GameApiResponse): SafeGameAccess {
  return {
    id: game.id,
    name: game.name,
    coverUrl: getGameCoverUrl(game),
    rating: getGameRating(game),
    releaseYear: getGameReleaseYear(game),
    genres: getGameGenres(game)
  };
}

/**
 * Advanced utilities for common game operations
 */

// Check if game has meaningful cover image (not placeholder)
export function hasValidCover(game: GameApiResponse): boolean {
  const coverUrl = getGameCoverUrl(game);
  return coverUrl !== null && !coverUrl.includes('placeholder');
}

// Check if game has meaningful rating
export function hasValidRating(game: GameApiResponse): boolean {
  const rating = getGameRating(game);
  return rating !== null && rating > 0;
}

// Filter games by criteria - type-safe filtering
export interface GameFilterCriteria {
  hasValidCover?: boolean;
  hasValidRating?: boolean;
  minRating?: number;
  excludeIds?: string[];
  genres?: string[];
}

export function filterGames(games: GameApiResponse[], criteria: GameFilterCriteria = {}): GameApiResponse[] {
  return games.filter(game => {
    // Check cover requirement
    if (criteria.hasValidCover && !hasValidCover(game)) {
      return false;
    }
    
    // Check rating requirement
    if (criteria.hasValidRating && !hasValidRating(game)) {
      return false;
    }
    
    // Check minimum rating
    if (criteria.minRating) {
      const rating = getGameRating(game);
      if (!rating || rating < criteria.minRating) {
        return false;
      }
    }
    
    // Check excluded IDs
    if (criteria.excludeIds && criteria.excludeIds.includes(game.id)) {
      return false;
    }
    
    // Check genres
    if (criteria.genres && criteria.genres.length > 0) {
      const gameGenres = getGameGenres(game);
      const genreNames = gameGenres.map(g => g.name.toLowerCase());
      const hasMatchingGenre = criteria.genres.some(genre => 
        genreNames.includes(genre.toLowerCase())
      );
      if (!hasMatchingGenre) {
        return false;
      }
    }
    
    return true;
  });
}

// Sort games by various criteria - type-safe sorting
export type GameSortBy = 'rating' | 'name' | 'release' | 'popularity';

export function sortGames(games: GameApiResponse[], sortBy: GameSortBy = 'rating'): GameApiResponse[] {
  const sortedGames = [...games];
  
  switch (sortBy) {
    case 'rating':
      return sortedGames.sort((a, b) => {
        const ratingA = getGameRating(a) || 0;
        const ratingB = getGameRating(b) || 0;
        return ratingB - ratingA; // Highest first
      });
      
    case 'name':
      return sortedGames.sort((a, b) => a.name.localeCompare(b.name));
      
    case 'release':
      return sortedGames.sort((a, b) => {
        const yearA = getGameReleaseYear(a) || 0;
        const yearB = getGameReleaseYear(b) || 0;
        return yearB - yearA; // Most recent first
      });
      
    case 'popularity':
      // If we don't have explicit popularity, use rating as proxy
      return sortedGames.sort((a, b) => {
        const ratingA = getGameRating(a) || 0;
        const ratingB = getGameRating(b) || 0;
        return ratingB - ratingA;
      });
      
    default:
      return sortedGames;
  }
}

/**
 * Batch processing utilities for performance
 */

// Convert multiple games to safe access format - efficient batch processing
export function toSafeGameAccessBatch(games: GameApiResponse[]): SafeGameAccess[] {
  return games.map(toSafeGameAccess);
}

// Process and filter related games in one operation - inevitable pattern for components
export function processRelatedGames(
  games: GameApiResponse[],
  currentGameId: string,
  limit: number = 8
): SafeGameAccess[] {
  return toSafeGameAccessBatch(
    filterGames(games, {
      hasValidCover: true,
      excludeIds: [currentGameId]
    })
    .slice(0, limit)
  );
}