/**
 * Converts a thumbnail URL to a high-quality image URL
 */
export function getHighQualityImageUrl(url: string): string {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_1080p/")}`
    : url.replace("/t_thumb/", "/t_1080p/");
}

/**
 * Converts a thumbnail URL to a cover image URL
 */
export function getCoverImageUrl(url: string): string {
  return url.startsWith("//")
    ? `https:${url.replace("/t_thumb/", "/t_cover_big/")}`
    : url.replace("/t_thumb/", "/t_cover_big/");
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