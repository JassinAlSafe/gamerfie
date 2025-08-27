// Add constants at the top
export const IGDB_IMAGE_SIZES = {
  COVER: {
    SMALL: 't_thumb',
    MEDIUM: 't_cover_big',
    LARGE: 't_cover_big_2x',
    ULTRA: 't_1080p',
    ORIGINAL: 't_original'  // Highest quality for covers
  },
  SCREENSHOT: {
    MEDIUM: 't_720p',
    LARGE: 't_1080p',
    ULTRA: 't_screenshot_huge',
    ORIGINAL: 't_original' // Highest quality for screenshots
  },
  ARTWORK: {
    MEDIUM: 't_720p',
    LARGE: 't_1080p',
    ULTRA: 't_screenshot_huge',
    ORIGINAL: 't_original' // Best for artworks
  }
} as const;

/**
 * Ensures a URL has the HTTPS protocol
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Converts a thumbnail URL to a high-quality image URL
 */
export function getHighQualityImageUrl(url: string): string {
  if (!url) return "/images/placeholders/game-cover.jpg";
  
  // First ensure HTTPS protocol
  url = ensureHttps(url);
  
  // Handle IGDB URLs
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // For IGDB, use the highest quality available
    if (processedUrl.includes("/t_")) {
      // Check if it's a screenshot/artwork or cover
      if (processedUrl.includes('screenshot') || processedUrl.includes('artwork')) {
        processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.SCREENSHOT.ORIGINAL}/`);
      } else {
        processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.COVER.ORIGINAL}/`);
      }
    } else {
      const parts = processedUrl.split("/upload/");
      if (parts.length === 2) {
        processedUrl = `${parts[0]}/upload/${IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA}/${parts[1]}`;
      }
    }

    // Remove any double slashes (except after protocol)
    processedUrl = processedUrl.replace(/([^:])\/\//g, '$1/');

    return processedUrl;
  }
  
  // Handle YouTube thumbnail URLs - get highest quality version
  if (url.includes('youtube.com/vi/') || url.includes('img.youtube.com')) {
    // Try to get the maxresdefault version if possible
    return url.replace(/\/[^\/]+\.jpg$/, '/maxresdefault.jpg');
  }
  
  return url;
}

/**
 * Gets optimized image URL based on usage context
 */
export function getOptimizedImageUrl(
  url: string, 
  context: 'hero' | 'card' | 'thumbnail' | 'background' = 'card'
): string {
  if (!url) return "/images/placeholders/game-cover.jpg";
  
  url = ensureHttps(url);
  
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // Choose appropriate size based on context
    let targetSize: string;
    switch (context) {
      case 'hero':
        targetSize = IGDB_IMAGE_SIZES.COVER.ULTRA;
        break;
      case 'card':
        targetSize = IGDB_IMAGE_SIZES.COVER.LARGE;
        break;
      case 'thumbnail':
        targetSize = IGDB_IMAGE_SIZES.COVER.MEDIUM;
        break;
      case 'background':
        targetSize = IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA;
        break;
      default:
        targetSize = IGDB_IMAGE_SIZES.COVER.MEDIUM;
    }
    
    if (processedUrl.includes("/t_")) {
      processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${targetSize}/`);
    } else {
      const parts = processedUrl.split("/upload/");
      if (parts.length === 2) {
        processedUrl = `${parts[0]}/upload/${targetSize}/${parts[1]}`;
      }
    }

    processedUrl = processedUrl.replace(/([^:])\/\//g, '$1/');
    return processedUrl;
  }
  
  return url;
}

/**
 * Converts a thumbnail URL to a cover image URL with highest quality
 */
export function getCoverImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.jpg";

  // Handle special RAWG background image marker
  if (url.startsWith('rawg-bg:')) {
    // This indicates a RAWG background image (screenshot) being used as temporary cover
    // Extract the actual URL and return it, but mark it as not ideal
    const actualUrl = url.replace('rawg-bg:', '');
    return ensureHttps(actualUrl);
  }

  // Handle RAWG URLs - get highest quality version
  if (url.includes('media.rawg.io')) {
    let processedUrl = ensureHttps(url);
    
    // RAWG URLs often have size parameters - try to get full size
    // Convert crop or resize parameters to get full image
    processedUrl = processedUrl.replace(/\/resize\/\d+x\d+\//, '/');
    processedUrl = processedUrl.replace(/\/crop\/\d+x\d+\//, '/');
    
    // If it's a background image, it's usually already high quality
    return processedUrl;
  }

  // Handle IGDB URLs - these are proper game covers
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // Add HTTPS if needed
    processedUrl = ensureHttps(processedUrl);

    // For IGDB, use the highest quality cover size
    if (processedUrl.includes("/t_")) {
      processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.COVER.ORIGINAL}/`);
    } else {
      const parts = processedUrl.split("/upload/");
      if (parts.length === 2) {
        processedUrl = `${parts[0]}/upload/${IGDB_IMAGE_SIZES.COVER.ORIGINAL}/${parts[1]}`;
      }
    }

    // Remove any double slashes (except after protocol)
    processedUrl = processedUrl.replace(/([^:])\/\//g, '$1/');

    return processedUrl;
  }

  // For other URLs, ensure HTTPS and return
  return url.startsWith('http') ? url : `https://${url}`;
}

/**
 * Checks if a cover URL is a proper game cover (not a screenshot)
 */
export function isProperGameCover(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // IGDB URLs are always proper covers
  if (url.includes('igdb.com')) return true;
  
  // RAWG background images are screenshots, not covers
  if (url.startsWith('rawg-bg:') || url.includes('media.rawg.io')) return false;
  
  return true;
}

/**
 * Gets the background image URL from game artworks or screenshots
 */
export function getBackgroundImageUrl(game: {
  artworks?: { url: string }[];
  screenshots?: { url: string }[];
}): string | null {
  // Prefer artworks over screenshots for background
  if (game.artworks && game.artworks.length > 0) {
    // Try to find a landscape artwork (usually better for backgrounds)
    const landscapeArtwork = game.artworks.find(art => {
      const url = art.url.toLowerCase();
      return !url.includes('portrait') && !url.includes('cover');
    });
    return getHighQualityImageUrl(landscapeArtwork?.url || game.artworks[0].url);
  }
  
  if (game.screenshots && game.screenshots.length > 0) {
    // Try to find a non-UI screenshot (usually better for backgrounds)
    const cleanScreenshot = game.screenshots.find(screen => {
      const url = screen.url.toLowerCase();
      return !url.includes('ui') && !url.includes('menu');
    });
    return getHighQualityImageUrl(cleanScreenshot?.url || game.screenshots[0].url);
  }
  
  return null;
}

/**
 * Gets a YouTube video thumbnail from a video URL or ID
 */
export function getYouTubeThumbnail(videoUrl: string | undefined, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'maxres'): string {
  if (!videoUrl) return "/images/placeholders/game-cover.jpg";
  
  // Extract video ID from URL
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = videoUrl.match(youtubeRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  }
  
  // If the input is just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
    return `https://img.youtube.com/vi/${videoUrl}/${quality}default.jpg`;
  }
  
  return "/images/placeholders/game-cover.jpg";
}

/**
 * Converts a YouTube URL to an embed URL
 */
export function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  // YouTube URL pattern
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  }
  
  return null;
}