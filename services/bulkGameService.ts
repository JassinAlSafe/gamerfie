import { IGDBService } from './igdb';

interface GameDetails {
  name: string;
  cover_url?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  release_date?: string;
}

interface BulkGameResult {
  [gameId: string]: GameDetails;
}

// Cache for bulk results
const bulkCache = new Map<string, { data: BulkGameResult; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export class BulkGameService {
  /**
   * Fetch multiple game details in a single IGDB API call
   */
  static async fetchBulkGameDetails(gameIds: string[]): Promise<BulkGameResult> {
    if (gameIds.length === 0) return {};

    // Parse numeric IDs from prefixed IDs
    const numericIds = gameIds.map(id => id.replace(/^igdb_/, '')).filter(Boolean);
    
    if (numericIds.length === 0) return {};

    // Create cache key from sorted IDs
    const cacheKey = numericIds.sort().join(',');
    
    // Check cache first
    const cached = bulkCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Using cached bulk game details for ${numericIds.length} games`);
      return cached.data;
    }

    try {
      console.log(`🚀 Fetching bulk game details for ${numericIds.length} games`);
      
      // Create single IGDB query for all games
      const query = `
        fields name, 
               cover.url, 
               cover.image_id,
               genres.name, 
               involved_companies.company.name,
               involved_companies.developer,
               involved_companies.publisher,
               first_release_date;
        where id = (${numericIds.join(',')});
        limit 500;
      `;
      
      console.log(`🔍 IGDB Query: ${query.trim()}`);

      // Use the same proxy URL logic as IGDBService
      const isServer = typeof window === 'undefined';
      const proxyUrl = isServer 
        ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/igdb-proxy`
        : '/api/igdb-proxy';

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`IGDB bulk fetch failed: ${response.status}`);
      }

      const games = await response.json();
      
      console.log(`📦 IGDB returned ${games.length} games for IDs: ${numericIds.join(', ')}`);
      
      // Log which specific games were returned
      const returnedIds = games.map((g: any) => g.id);
      const missingIds = numericIds.filter(id => !returnedIds.includes(parseInt(id)));
      
      if (missingIds.length > 0) {
        console.warn(`❌ Missing games from IGDB response: ${missingIds.join(', ')}`);
        console.warn(`⚠️ These games may not exist in IGDB database or have been removed`);
      }
      
      // Transform results into our format
      const result: BulkGameResult = {};
      
      games.forEach((game: any) => {
        const gameId = `igdb_${game.id}`;
        
        console.log(`🎮 Processing game: ${game.name} (ID: ${game.id})`);
        
        result[gameId] = {
          name: game.name || `Game ${game.id}`,
          cover_url: game.cover?.url ? (
            game.cover.url.startsWith('//') 
              ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
              : game.cover.url.startsWith('https:') 
                ? game.cover.url.replace('t_thumb', 't_cover_big')
                : `https://${game.cover.url.replace('t_thumb', 't_cover_big')}`
          ) : undefined,
          developer: game.involved_companies?.find((c: any) => c.developer)?.company?.name,
          publisher: game.involved_companies?.find((c: any) => c.publisher)?.company?.name,
          genres: game.genres?.map((g: any) => g.name) || [],
          release_date: game.first_release_date 
            ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
            : undefined
        };
      });

      // Add fallback data for missing games
      gameIds.forEach(gameId => {
        if (!result[gameId]) {
          const numericId = gameId.replace('igdb_', '');
          console.warn(`⚠️ Adding fallback data for missing game: ${gameId} (numeric: ${numericId})`);
          result[gameId] = {
            name: `Game Not Found (ID: ${numericId})`,
            cover_url: undefined,
            developer: "Game may no longer exist in IGDB",
            publisher: "Unknown Publisher", 
            genres: ["Unknown"],
            release_date: undefined
          };
        }
      });

      // Cache the result
      bulkCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Clean up old cache entries
      this.cleanupCache();

      console.log(`✅ Successfully fetched bulk details for ${Object.keys(result).length} games`);
      return result;

    } catch (error) {
      console.error('Bulk game details fetch failed:', error);
      
      // Return fallback data for all games
      const fallbackResult: BulkGameResult = {};
      gameIds.forEach(gameId => {
        fallbackResult[gameId] = {
          name: `Game ${gameId.replace('igdb_', '')}`,
          cover_url: undefined,
          developer: "Unknown Developer",
          publisher: "Unknown Publisher",
          genres: ["Unknown"],
          release_date: undefined
        };
      });
      
      return fallbackResult;
    }
  }

  /**
   * Clean up expired cache entries
   */
  private static cleanupCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of bulkCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        bulkCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired bulk cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: bulkCache.size,
      entries: Array.from(bulkCache.keys()),
      ttl: CACHE_TTL
    };
  }

  /**
   * Clear all cache
   */
  static clearCache() {
    bulkCache.clear();
    console.log('🧹 Cleared bulk game details cache');
  }
}