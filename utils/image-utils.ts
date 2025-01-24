/**
 * Ensures a URL has the HTTPS protocol
 */
function ensureHttps(url: string): string {
  if (!url) return url;
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (!url.startsWith('http')) {
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
export function getCoverImageUrl(url: string): string {
  if (!url) return "/placeholder.png";
  
  // First ensure HTTPS protocol
  url = ensureHttps(url);
  
  // Then replace size parameter
  if (url.includes("t_thumb")) {
    url = url.replace("t_thumb", "t_cover_big_2x");
  }
  
  return url;
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