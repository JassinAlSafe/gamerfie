/**
 * Playlist Image Utilities
 * Handles image selection and quality for playlist games
 */

import { getCoverImageUrl } from './image-utils';

interface GameImageData {
  cover?: { id: string; url: string } | string;
  cover_url?: string | null;
  background_image?: string | null;
  name?: string;
}

/**
 * Gets the best available cover image for a game in playlists
 * Prioritizes actual game covers over background images (screenshots)
 */
export function getPlaylistGameCoverUrl(game: GameImageData): string {
  // Priority order:
  // 1. IGDB cover (highest quality, actual game cover)
  // 2. cover_url field (usually from database)
  // 3. background_image (fallback, usually a screenshot)
  
  let coverUrl: string | null = null;

  // Handle cover object or string
  if (game.cover) {
    if (typeof game.cover === 'object' && game.cover.url) {
      coverUrl = game.cover.url;
    } else if (typeof game.cover === 'string') {
      coverUrl = game.cover;
    }
  }

  // Fallback to cover_url
  if (!coverUrl && game.cover_url) {
    coverUrl = game.cover_url;
  }

  // Last resort: background image (usually screenshot)
  if (!coverUrl && game.background_image) {
    coverUrl = game.background_image;
  }

  // Process through image utils for quality optimization
  return getCoverImageUrl(coverUrl);
}

/**
 * Checks if the image URL is likely a proper game cover vs screenshot
 */
export function isProperGameCover(url: string | null): boolean {
  if (!url) return false;
  
  // IGDB covers are always proper covers
  if (url.includes('igdb.com') && url.includes('/t_cover_')) return true;
  
  // RAWG background images are usually screenshots
  if (url.includes('media.rawg.io') && !url.includes('/games/')) return false;
  
  // If it has cover-specific sizing, it's likely a proper cover
  if (url.includes('cover_big') || url.includes('cover_large')) return true;
  
  return true; // Default to treating as cover
}

/**
 * Preferred image settings for playlist displays
 */
export const PLAYLIST_IMAGE_CONFIG = {
  // For search results - prioritize covers
  SEARCH: {
    width: 40,
    height: 60, // 2:3 aspect ratio for covers
    priority: ['cover', 'cover_url', 'background_image']
  },
  
  // For selected games in editor
  EDITOR: {
    width: 40,
    height: 60,
    priority: ['cover', 'cover_url', 'background_image']
  },
  
  // For featured playlists on explore page
  FEATURED: {
    width: 120,
    height: 180,
    priority: ['cover', 'cover_url', 'background_image']
  }
} as const; 