import { BulkGameService } from './bulkGameService';
import { GameValidationService } from './gameValidationService';

interface GameDetails {
  name: string;
  cover_url?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  release_date?: string;
}

interface EnhancedBulkGameResult {
  [gameId: string]: GameDetails & {
    isValidated: boolean;
    validationReason?: string;
    lastValidated?: number;
  };
}

export class EnhancedBulkGameService {
  /**
   * Fetch game details with enhanced validation and fallback strategies
   */
  static async fetchValidatedGameDetails(gameIds: string[]): Promise<EnhancedBulkGameResult> {
    if (gameIds.length === 0) return {};

    console.log(`🔍 Enhanced bulk fetch for ${gameIds.length} games with validation`);

    // Step 1: Get bulk game data using existing service
    const bulkResults = await BulkGameService.fetchBulkGameDetails(gameIds);
    
    // Step 2: Identify games that need validation
    const needsValidation: string[] = [];
    const enhancedResults: EnhancedBulkGameResult = {};

    Object.entries(bulkResults).forEach(([gameId, gameData]) => {
      const isDataMissing = gameData.genres?.includes("Game Data Missing") || 
                           gameData.developer === "Data unavailable";
      
      if (isDataMissing) {
        needsValidation.push(gameId);
      }
      
      enhancedResults[gameId] = {
        ...gameData,
        isValidated: !isDataMissing,
        validationReason: isDataMissing ? 'needs_validation' : 'valid',
        lastValidated: Date.now()
      };
    });

    // Step 3: Validate problematic games
    if (needsValidation.length > 0) {
      console.log(`🔍 Validating ${needsValidation.length} problematic games`);
      
      const validationResults = await GameValidationService.validateGames(needsValidation);
      
      Object.entries(validationResults).forEach(([gameId, validation]) => {
        if (validation.isValid && validation.alternativeData) {
          // Use validated data
          enhancedResults[gameId] = {
            ...validation.alternativeData,
            isValidated: true,
            validationReason: 'validated_success',
            lastValidated: Date.now()
          };
          console.log(`✅ Updated ${gameId} with validated data`);
        } else {
          // Keep fallback data but mark validation attempt
          enhancedResults[gameId] = {
            ...enhancedResults[gameId],
            isValidated: false,
            validationReason: validation.reason || 'validation_failed',
            lastValidated: Date.now()
          };
          console.warn(`⚠️ Validation failed for ${gameId}: ${validation.reason}`);
        }
      });
    }

    const validatedCount = Object.values(enhancedResults).filter(r => r.isValidated).length;
    console.log(`✅ Enhanced bulk fetch complete: ${validatedCount}/${gameIds.length} games validated`);

    return enhancedResults;
  }

  /**
   * Get games that consistently fail validation (for admin review)
   */
  static async getProblematicGames(gameIds: string[]): Promise<string[]> {
    const problematicGames: string[] = [];
    
    for (const gameId of gameIds) {
      const cached = GameValidationService.getCachedValidation(gameId);
      if (cached && !cached.isValid && cached.reason === 'not_found') {
        problematicGames.push(gameId);
      }
    }
    
    return problematicGames;
  }

  /**
   * Cleanup and maintenance utilities
   */
  static async performMaintenance() {
    console.log('🧹 Performing enhanced bulk game service maintenance...');
    
    // Clean up validation cache
    const cleanedValidation = GameValidationService.cleanupCache();
    
    // Clean up bulk cache
    BulkGameService.cleanupCache();
    
    // Get validation stats
    const stats = GameValidationService.getValidationStats();
    
    console.log(`🧹 Maintenance complete:
      - Cleaned ${cleanedValidation} validation cache entries
      - Validation stats: ${stats.valid}/${stats.total} valid (${stats.cacheHitRate}% cache hit rate)
      - ${stats.apiErrors} API errors detected
    `);
    
    return {
      cleanedValidation,
      validationStats: stats
    };
  }

  /**
   * Batch validate all games in the system (admin utility)
   */
  static async validateAllGames(gameIds: string[], batchSize: number = 50): Promise<{
    validated: number;
    failed: number;
    invalid: number;
    errors: string[];
  }> {
    let validated = 0;
    let failed = 0;
    let invalid = 0;
    const errors: string[] = [];

    console.log(`🚀 Starting batch validation of ${gameIds.length} games...`);

    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      
      try {
        const results = await GameValidationService.validateGames(batch);
        
        Object.entries(results).forEach(([gameId, result]) => {
          if (result.isValid) {
            validated++;
          } else if (result.reason === 'not_found') {
            invalid++;
          } else {
            failed++;
            errors.push(`${gameId}: ${result.reason}`);
          }
        });
        
        console.log(`📊 Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} games processed`);
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
        batch.forEach(gameId => {
          failed++;
          errors.push(`${gameId}: batch_error`);
        });
      }
    }

    console.log(`✅ Batch validation complete:
      - Validated: ${validated}
      - Invalid: ${invalid}  
      - Failed: ${failed}
      - Error rate: ${(failed/gameIds.length*100).toFixed(1)}%
    `);

    return { validated, failed, invalid, errors };
  }
}