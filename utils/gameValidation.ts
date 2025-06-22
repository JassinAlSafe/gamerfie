import { GameValidationService } from '@/services/gameValidationService';

/**
 * Utility functions for game validation in forms and UI components
 */

export interface GameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validate a game ID before allowing review creation
 */
export async function validateGameForReview(gameId: string): Promise<GameValidationResult> {
  const result: GameValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic format validation
  if (!gameId || typeof gameId !== 'string') {
    result.isValid = false;
    result.errors.push('Game ID is required');
    return result;
  }

  // Check for obviously invalid patterns
  if (GameValidationService.isLikelyInvalidGameId(gameId)) {
    result.isValid = false;
    result.errors.push('Game ID appears to be invalid');
    result.suggestions.push('Please verify the game ID from IGDB');
    return result;
  }

  // Check cache first for performance
  const cachedValidation = GameValidationService.getCachedValidation(gameId);
  if (cachedValidation) {
    if (!cachedValidation.isValid) {
      result.isValid = false;
      
      switch (cachedValidation.reason) {
        case 'not_found':
          result.errors.push('This game was not found in the IGDB database');
          result.suggestions.push('The game may have been removed or the ID may be incorrect');
          break;
        case 'api_error':
          result.warnings.push('Unable to verify game at this time');
          result.suggestions.push('You can proceed, but the game details may not display correctly');
          break;
        default:
          result.errors.push('Game validation failed');
      }
    }
    return result;
  }

  // Perform live validation
  try {
    const validation = await GameValidationService.validateGame(gameId);
    
    if (!validation.isValid) {
      result.isValid = false;
      
      switch (validation.reason) {
        case 'not_found':
          result.errors.push('This game was not found in the IGDB database');
          result.suggestions.push('Please check the game ID or search for the game again');
          break;
        case 'api_error':
          result.warnings.push('Unable to verify game details');
          result.suggestions.push('You can proceed, but the game may not display correctly');
          // Allow creation but with warning
          result.isValid = true;
          break;
        default:
          result.errors.push('Game validation failed');
      }
    } else {
      result.suggestions.push(`Game validated: ${validation.alternativeData?.name || 'Unknown'}`);
    }
    
  } catch (error) {
    result.warnings.push('Unable to validate game at this time');
    result.suggestions.push('You can proceed, but the game details may not load correctly');
    // Allow creation with warning rather than blocking
    result.isValid = true;
  }

  return result;
}

/**
 * Get user-friendly validation message for UI display
 */
export function getValidationMessage(validation: GameValidationResult): {
  type: 'error' | 'warning' | 'success';
  message: string;
  details?: string[];
} {
  if (validation.errors.length > 0) {
    return {
      type: 'error',
      message: validation.errors[0],
      details: validation.suggestions.length > 0 ? validation.suggestions : undefined
    };
  }
  
  if (validation.warnings.length > 0) {
    return {
      type: 'warning',
      message: validation.warnings[0],
      details: validation.suggestions.length > 0 ? validation.suggestions : undefined
    };
  }
  
  return {
    type: 'success',
    message: validation.suggestions[0] || 'Game validated successfully'
  };
}

/**
 * Batch validate multiple games (useful for imports/admin tools)
 */
export async function validateGamesForBulkOperation(
  gameIds: string[]
): Promise<{
  valid: string[];
  invalid: string[];
  warnings: string[];
  report: Record<string, GameValidationResult>;
}> {
  const report: Record<string, GameValidationResult> = {};
  const valid: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Process in chunks to avoid overwhelming the API
  const chunkSize = 20;
  for (let i = 0; i < gameIds.length; i += chunkSize) {
    const chunk = gameIds.slice(i, i + chunkSize);
    
    const chunkPromises = chunk.map(async (gameId) => {
      const validation = await validateGameForReview(gameId);
      report[gameId] = validation;
      
      if (validation.isValid) {
        if (validation.warnings.length > 0) {
          warnings.push(gameId);
        } else {
          valid.push(gameId);
        }
      } else {
        invalid.push(gameId);
      }
    });
    
    await Promise.all(chunkPromises);
    
    // Small delay between chunks
    if (i + chunkSize < gameIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { valid, invalid, warnings, report };
}

/**
 * Check if a review should show validation warnings
 */
export function shouldShowValidationWarning(gameDetails: any): boolean {
  return gameDetails?.genres?.includes("Game Data Missing") ||
         gameDetails?.developer === "Data unavailable" ||
         gameDetails?.validationReason === 'not_found';
}

/**
 * Get validation warning message for existing reviews
 */
export function getReviewValidationWarning(gameDetails: any): string | null {
  if (gameDetails?.genres?.includes("Game Data Missing")) {
    return "This game's data could not be loaded from IGDB";
  }
  
  if (gameDetails?.validationReason === 'not_found') {
    return "This game was not found in the IGDB database";
  }
  
  if (gameDetails?.developer === "Data unavailable") {
    return "Game details are currently unavailable";
  }
  
  return null;
}