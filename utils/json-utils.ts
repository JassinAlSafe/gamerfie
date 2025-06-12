/**
 * Utility functions for safe JSON parsing operations
 */

/**
 * Safely parse a JSON string with a fallback value
 * @param jsonString - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns Parsed JSON object or fallback value
 */
export const safeJsonParse = <T = any>(
  jsonString: string | null | undefined, 
  fallback: T = [] as T
): T => {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null ? parsed : fallback;
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return fallback;
  }
};

/**
 * Safely parse platforms data from various formats
 * @param platforms - Platforms data (string, array, or null)
 * @returns Array of platform objects with string IDs
 */
export const safeParsePlatforms = (
  platforms: string | Array<{ id: string | number; name: string }> | null | undefined
): Array<{ id: string; name: string }> => {
  if (!platforms) return [];
  
  if (Array.isArray(platforms)) {
    return platforms.map(platform => ({
      ...platform,
      id: String(platform.id) // Convert ID to string
    }));
  }
  
  if (typeof platforms === 'string') {
    const parsed = safeJsonParse(platforms, []);
    return parsed.map((platform: any) => ({
      ...platform,
      id: String(platform.id) // Convert ID to string
    }));
  }
  
  return [];
};

/**
 * Safely parse genres data from various formats
 * @param genres - Genres data (string, array, or null)
 * @returns Array of genre objects with string IDs
 */
export const safeParseGenres = (
  genres: string | Array<{ id: string | number; name: string }> | null | undefined
): Array<{ id: string; name: string }> => {
  if (!genres) return [];
  
  if (Array.isArray(genres)) {
    return genres.map(genre => ({
      ...genre,
      id: String(genre.id) // Convert ID to string
    }));
  }
  
  if (typeof genres === 'string') {
    const parsed = safeJsonParse(genres, []);
    return parsed.map((genre: any) => ({
      ...genre,
      id: String(genre.id) // Convert ID to string
    }));
  }
  
  return [];
};

/**
 * Validate and normalize game data structure
 * @param gameData - Raw game data from database
 * @returns Normalized game object or null if invalid
 */
export const normalizeGameData = (gameData: any) => {
  if (!gameData || !gameData.id) {
    console.warn('Invalid game data: missing id', gameData);
    return null;
  }

  return {
    ...gameData,
    platforms: safeParsePlatforms(gameData.platforms),
    genres: safeParseGenres(gameData.genres),
    // Ensure name is available with fallback
    name: gameData.name || gameData.title || `Game ${gameData.id}`,
  };
};