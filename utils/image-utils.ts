// Add constants at the top
export const IGDB_IMAGE_SIZES = {
  COVER: {
    SMALL: 't_thumb',
    MEDIUM: 't_cover_big',
    LARGE: 't_cover_big_2x'  // Highest quality for covers
  },
  SCREENSHOT: {
    MEDIUM: 't_720p',
    LARGE: 't_1080p',
    ULTRA: 't_screenshot_huge' // Highest quality for screenshots
  },
  ARTWORK: {
    MEDIUM: 't_720p',
    LARGE: 't_1080p',
    ULTRA: 't_screenshot_huge' // Best for artworks
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
  if (!url) return "/placeholder.png";
  
  // First ensure HTTPS protocol
  url = ensureHttps(url);
  
  // Handle IGDB URLs
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // For IGDB, use the highest quality available
    if (processedUrl.includes("/t_")) {
      // Check if it's a screenshot/artwork or cover
      if (processedUrl.includes('screenshot') || processedUrl.includes('artwork')) {
        processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA}/`);
      } else {
        processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.COVER.LARGE}/`);
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
 * Converts a thumbnail URL to a cover image URL
 */
export function getCoverImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.jpg";

  // Handle RAWG URLs
  if (url.includes('media.rawg.io')) {
    return ensureHttps(url);
  }

  // Handle IGDB URLs
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // Add HTTPS if needed
    processedUrl = ensureHttps(processedUrl);

    // For IGDB, use the highest quality cover size
    if (processedUrl.includes("/t_")) {
      processedUrl = processedUrl.replace(/\/t_[^/]+\//, `/${IGDB_IMAGE_SIZES.COVER.LARGE}/`);
    } else {
      const parts = processedUrl.split("/upload/");
      if (parts.length === 2) {
        processedUrl = `${parts[0]}/upload/${IGDB_IMAGE_SIZES.COVER.LARGE}/${parts[1]}`;
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
  if (!videoUrl) return "/placeholder.png";
  
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
  
  return "/placeholder.png";
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