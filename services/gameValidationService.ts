import { IGDBService } from './igdb';

interface ValidationResult {
  isValid: boolean;
  reason?: 'not_found' | 'api_error' | 'invalid_id';
  alternativeData?: {
    name: string;
    cover_url?: string;
    developer?: string;
    publisher?: string;
    genres?: string[];
    release_date?: string;
  };
}

interface GameValidationCache {
  [gameId: string]: {
    result: ValidationResult;
    timestamp: number;
    retryCount: number;
  };
}

export class GameValidationService {
  private static cache: GameValidationCache = {};
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Validate a single game ID and return validation result
   */
  static async validateGame(gameId: string): Promise<ValidationResult> {
    const numericId = gameId.replace(/^igdb_/, '');
    
    // Check cache first
    const cached = this.cache[gameId];
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📦 Using cached validation for game ${gameId}`);
      return cached.result;
    }

    try {
      console.log(`🔍 Validating game ID: ${gameId}`);
      
      // Try to fetch the game from IGDB
      const game = await IGDBService.fetchGameDetails(numericId);
      
      if (game && game.name) {
        const result: ValidationResult = {
          isValid: true,
          alternativeData: {
            name: game.name,
            cover_url: game.cover_url,
            developer: game.involved_companies?.find((c: any) => c.developer)?.company?.name,
            publisher: game.involved_companies?.find((c: any) => c.publisher)?.company?.name,
            genres: game.genres,
            release_date: game.first_release_date 
              ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
              : undefined
          }
        };
        
        // Cache successful validation
        this.cache[gameId] = {
          result,
          timestamp: Date.now(),
          retryCount: 0
        };
        
        console.log(`✅ Game ${gameId} is valid: ${game.name}`);
        return result;
      } else {
        // Game not found in IGDB
        const result: ValidationResult = {
          isValid: false,
          reason: 'not_found'
        };
        
        // Cache invalid result
        this.cache[gameId] = {
          result,
          timestamp: Date.now(),
          retryCount: 0
        };
        
        console.warn(`❌ Game ${gameId} not found in IGDB`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error validating game ${gameId}:`, error);
      
      // Check retry count
      const retryCount = cached?.retryCount || 0;
      if (retryCount < this.MAX_RETRIES) {
        // Schedule retry
        setTimeout(() => {
          this.validateGame(gameId);
        }, this.RETRY_DELAY * (retryCount + 1));
        
        // Update retry count
        this.cache[gameId] = {
          result: { isValid: false, reason: 'api_error' },
          timestamp: Date.now(),
          retryCount: retryCount + 1
        };
      }
      
      return {
        isValid: false,
        reason: 'api_error'
      };
    }
  }

  /**
   * Validate multiple games in batch
   */
  static async validateGames(gameIds: string[]): Promise<Record<string, ValidationResult>> {
    console.log(`🚀 Batch validating ${gameIds.length} games`);
    
    const results: Record<string, ValidationResult> = {};
    
    // Process in chunks to avoid rate limiting
    const chunkSize = 10;
    for (let i = 0; i < gameIds.length; i += chunkSize) {
      const chunk = gameIds.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (gameId) => {
        const result = await this.validateGame(gameId);
        results[gameId] = result;
      });
      
      await Promise.all(chunkPromises);
      
      // Small delay between chunks
      if (i + chunkSize < gameIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    const validCount = Object.values(results).filter(r => r.isValid).length;
    console.log(`✅ Batch validation complete: ${validCount}/${gameIds.length} valid games`);
    
    return results;
  }

  /**
   * Get cached validation result without making API calls
   */
  static getCachedValidation(gameId: string): ValidationResult | null {
    const cached = this.cache[gameId];
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    return null;
  }

  /**
   * Check if a game ID is likely invalid based on pattern
   */
  static isLikelyInvalidGameId(gameId: string): boolean {
    const numericId = gameId.replace(/^igdb_/, '');
    
    // Check for common invalid patterns
    if (!/^\d+$/.test(numericId)) {
      return true; // Not a number
    }
    
    const id = parseInt(numericId);
    if (id <= 0 || id > 500000) {
      return true; // Outside reasonable IGDB ID range
    }
    
    return false;
  }

  /**
   * Generate fallback data for invalid games
   */
  static generateFallbackData(gameId: string, reason: string = 'not_found'): any {
    const numericId = gameId.replace(/^igdb_/, '');
    
    switch (reason) {
      case 'not_found':
        return {
          name: `Unknown Game (ID: ${numericId})`,
          cover_url: undefined,
          developer: "Data unavailable",
          publisher: "Data unavailable",
          genres: ["Game Data Missing"],
          release_date: undefined
        };
      case 'api_error':
        return {
          name: `Game ${numericId} (Loading...)`,
          cover_url: undefined,
          developer: "Loading...",
          publisher: "Loading...",
          genres: ["Loading"],
          release_date: undefined
        };
      default:
        return {
          name: `Unknown Game (ID: ${numericId})`,
          cover_url: undefined,
          developer: "Data unavailable",
          publisher: "Data unavailable",
          genres: ["Game Data Missing"],
          release_date: undefined
        };
    }
  }

  /**
   * Get validation statistics
   */
  static getValidationStats() {
    const entries = Object.values(this.cache);
    const total = entries.length;
    const valid = entries.filter(e => e.result.isValid).length;
    const invalid = entries.filter(e => !e.result.isValid).length;
    const apiErrors = entries.filter(e => e.result.reason === 'api_error').length;
    
    return {
      total,
      valid,
      invalid,
      apiErrors,
      cacheHitRate: total > 0 ? ((valid + invalid - apiErrors) / total * 100).toFixed(1) : '0'
    };
  }

  /**
   * Clear cache entries older than TTL
   */
  static cleanupCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    Object.keys(this.cache).forEach(gameId => {
      if (now - this.cache[gameId].timestamp > this.CACHE_TTL) {
        delete this.cache[gameId];
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired validation cache entries`);
    }
    
    return cleanedCount;
  }

  /**
   * Clear all validation cache
   */
  static clearCache() {
    this.cache = {};
    console.log('🧹 Cleared game validation cache');
  }

  /**
   * Get list of all invalid game IDs for admin review
   */
  static getInvalidGameIds(): string[] {
    return Object.keys(this.cache).filter(gameId => 
      !this.cache[gameId].result.isValid && 
      this.cache[gameId].result.reason === 'not_found'
    );
  }

  /**
   * Bulk validate and update game data with better fallbacks
   */
  static async validateAndEnhanceGameData(gameIds: string[]): Promise<Record<string, any>> {
    const validations = await this.validateGames(gameIds);
    const enhancedData: Record<string, any> = {};
    
    Object.entries(validations).forEach(([gameId, validation]) => {
      if (validation.isValid && validation.alternativeData) {
        enhancedData[gameId] = validation.alternativeData;
      } else {
        enhancedData[gameId] = this.generateFallbackData(
          gameId, 
          validation.reason || 'not_found'
        );
      }
    });
    
    return enhancedData;
  }
}