/**
 * Game ID Mapping Service
 * 
 * This service handles the conversion between RAWG and IGDB game IDs
 * to ensure consistency across the platform. It's designed to support
 * the architectural migration from RAWG-based playlists to IGDB-first approach.
 */

import { RAWGService } from './rawgService';
import { IGDBService } from './igdb';

interface GameIdMapping {
  rawg_id: string;
  igdb_id: string;
  game_name: string;
  confidence: number; // 0-1 score for mapping accuracy
  last_updated: string;
}

export class GameIdMappingService {
  private static mappingCache = new Map<string, GameIdMapping>();
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Convert RAWG ID to IGDB ID with high confidence matching
   */
  static async convertRawgToIgdb(rawgId: string): Promise<string | null> {
    try {
      console.log(`🔄 Converting RAWG ID to IGDB: ${rawgId}`);
      
      // Check cache first
      const cached = this.mappingCache.get(rawgId);
      if (cached && Date.now() - new Date(cached.last_updated).getTime() < this.CACHE_TTL) {
        console.log(`✅ Found cached mapping: ${rawgId} -> ${cached.igdb_id}`);
        return cached.igdb_id;
      }

      // Get game details from RAWG
      const rawgGame = await RAWGService.getGameDetails(rawgId);
      if (!rawgGame) {
        console.warn(`❌ RAWG game not found: ${rawgId}`);
        return null;
      }

      console.log(`🔍 RAWG game found: "${rawgGame.name}" (${(rawgGame as any).released || 'unknown date'})`);

      // Search for matching IGDB game
      const searchResults = await IGDBService.getGames(1, 10, {
        page: 1,
        limit: 10,
        search: rawgGame.name,
        sortBy: 'popularity'
      });
      
      if (searchResults.games.length === 0) {
        console.warn(`❌ No IGDB matches found for: ${rawgGame.name}`);
        return null;
      }

      // Find best match based on name similarity and release date
      const bestMatch = this.findBestMatch(rawgGame, searchResults.games);
      
      if (!bestMatch) {
        console.warn(`❌ No confident IGDB match for: ${rawgGame.name}`);
        return null;
      }

      const igdbId = `igdb_${bestMatch.id}`;
      console.log(`✅ Best IGDB match: "${bestMatch.name}" -> ${igdbId}`);

      // Cache the mapping
      const mapping: GameIdMapping = {
        rawg_id: rawgId,
        igdb_id: igdbId,
        game_name: rawgGame.name,
        confidence: bestMatch.confidence || 0.8,
        last_updated: new Date().toISOString()
      };

      this.mappingCache.set(rawgId, mapping);
      
      return igdbId;
    } catch (error) {
      console.error(`❌ Error converting RAWG to IGDB ID for ${rawgId}:`, error);
      return null;
    }
  }

  /**
   * Convert array of RAWG IDs to IGDB IDs
   */
  static async convertRawgArrayToIgdb(rawgIds: string[]): Promise<string[]> {
    console.log(`🔄 Converting ${rawgIds.length} RAWG IDs to IGDB format`);
    
    const results = await Promise.allSettled(
      rawgIds.map(id => this.convertRawgToIgdb(id))
    );

    const igdbIds = results
      .map((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        } else {
          console.warn(`❌ Failed to convert RAWG ID: ${rawgIds[index]}`);
          return null;
        }
      })
      .filter((id): id is string => id !== null);

    console.log(`✅ Successfully converted ${igdbIds.length}/${rawgIds.length} RAWG IDs to IGDB`);
    return igdbIds;
  }

  /**
   * Get IGDB equivalent for a game ID (handles both RAWG and IGDB IDs)
   */
  static async getIgdbId(gameId: string): Promise<string> {
    // If already IGDB format, return as-is
    if (gameId.startsWith('igdb_')) {
      return gameId;
    }

    // If RAWG format, convert to IGDB
    if (gameId.startsWith('rawg_')) {
      const igdbId = await this.convertRawgToIgdb(gameId);
      return igdbId || gameId; // Fallback to original if conversion fails
    }

    // If neither format, assume RAWG and add prefix
    const igdbId = await this.convertRawgToIgdb(`rawg_${gameId}`);
    return igdbId || `rawg_${gameId}`;
  }

  /**
   * Find best matching IGDB game based on name and release date
   */
  private static findBestMatch(rawgGame: any, igdbGames: any[]): any {
    let bestMatch = null;
    let highestScore = 0;

    for (const igdbGame of igdbGames) {
      const score = this.calculateMatchScore(rawgGame, igdbGame);
      
      if (score > highestScore && score > 0.7) { // Minimum confidence threshold
        highestScore = score;
        bestMatch = { ...igdbGame, confidence: score };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate match score between RAWG and IGDB games
   */
  private static calculateMatchScore(rawgGame: any, igdbGame: any): number {
    let score = 0;

    // Name similarity (weighted heavily)
    const nameSimilarity = this.calculateStringSimilarity(
      rawgGame.name.toLowerCase(),
      igdbGame.name.toLowerCase()
    );
    score += nameSimilarity * 0.7;

    // Release date similarity
    if ((rawgGame as any).released && igdbGame.first_release_date) {
      const rawgYear = new Date((rawgGame as any).released).getFullYear();
      const igdbYear = new Date(igdbGame.first_release_date * 1000).getFullYear();
      const yearDiff = Math.abs(rawgYear - igdbYear);
      
      if (yearDiff === 0) score += 0.2;
      else if (yearDiff === 1) score += 0.1;
      else if (yearDiff <= 2) score += 0.05;
    }

    // Platform overlap (if available)
    if (rawgGame.platforms && igdbGame.platforms) {
      const rawgPlatforms = rawgGame.platforms.map((p: any) => p.platform?.name?.toLowerCase() || '');
      const igdbPlatforms = igdbGame.platforms.map((p: any) => p.name?.toLowerCase() || '');
      
      const commonPlatforms = rawgPlatforms.filter((p: string) => 
        igdbPlatforms.some((ip: string) => ip.includes(p) || p.includes(ip))
      );
      
      if (commonPlatforms.length > 0) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Pre-defined mappings for common games to ensure accuracy
   */
  private static readonly MANUAL_MAPPINGS: Record<string, string> = {
    // DOOM series
    'rawg_2454': 'igdb_1020', // DOOM (2016)
    'rawg_11': 'igdb_1942',   // DOOM II: Hell on Earth
    'rawg_13': 'igdb_72',     // DOOM
    'rawg_23014': 'igdb_472', // DOOM 3
    'rawg_612': 'igdb_71',    // DOOM 3: BFG Edition
    
    // Add more mappings as needed
  };

  /**
   * Get manual mapping if available
   */
  static getManualMapping(rawgId: string): string | null {
    return this.MANUAL_MAPPINGS[rawgId] || null;
  }

  /**
   * Clear mapping cache
   */
  static clearCache(): void {
    this.mappingCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.mappingCache.size,
      mappings: Array.from(this.mappingCache.entries()).map(([key, value]) => ({
        rawg_id: key,
        igdb_id: value.igdb_id,
        game_name: value.game_name,
        confidence: value.confidence
      }))
    };
  }
}