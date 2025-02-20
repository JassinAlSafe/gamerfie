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
  
  // Then replace size parameter
  if (url.includes("t_thumb")) {
    url = url.replace("t_thumb", "t_1080p");
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
    // RAWG images already come in good quality, just ensure HTTPS
    return ensureHttps(url);
  }

  // Handle IGDB URLs
  if (url.includes('igdb.com')) {
    let processedUrl = url;
    
    // Add HTTPS if needed
    if (url.startsWith("//")) {
      processedUrl = `https:${url}`;
    }

    // For IGDB, try to use the best available size
    // t_cover_big is more reliable than t_1080p for cover images
    if (processedUrl.includes("/t_")) {
      processedUrl = processedUrl.replace(/\/t_[^/]+\//, '/t_cover_big/');
    } else {
      const parts = processedUrl.split("/upload/");
      if (parts.length === 2) {
        processedUrl = `${parts[0]}/upload/t_cover_big/${parts[1]}`;
      }
    }

    // Remove any double slashes (except after protocol)
    processedUrl = processedUrl.replace(/([^:])\/\//g, '$1/');

    console.log('IGDB URL processing:', {
      original: url,
      processed: processedUrl
    });

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
  if (game.artworks && game.artworks.length > 0) {
    return getHighQualityImageUrl(game.artworks[0].url);
  }
  if (game.screenshots && game.screenshots.length > 0) {
    return getHighQualityImageUrl(game.screenshots[0].url);
  }
  return null;
}