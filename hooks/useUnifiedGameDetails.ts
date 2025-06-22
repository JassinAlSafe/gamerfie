import { useState, useEffect, useRef } from "react";
import { EnhancedBulkGameService } from '@/services/enhancedBulkGameService';
import { BulkGameService } from '@/services/bulkGameService';

interface GameDetails {
  name: string;
  cover_url?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  release_date?: string;
  isValidated?: boolean;
  validationReason?: string;
  lastValidated?: number;
}

interface UseUnifiedGameDetailsOptions {
  enableValidation?: boolean;
  batchDelay?: number;
  maxRetries?: number;
}

/**
 * Unified hook for fetching game details that combines the best of both approaches:
 * - Bulk fetching for efficiency (from Reviews hook)
 * - Individual game support (from Games hook) 
 * - Enhanced validation and error handling
 * - Intelligent caching and batching
 */
export function useUnifiedGameDetails(
  gameIds: string | string[], 
  options: UseUnifiedGameDetailsOptions = {}
) {
  const {
    enableValidation = false,
    batchDelay = 50,
    maxRetries = 3
  } = options;

  // Normalize input to always be an array
  const normalizedGameIds = Array.isArray(gameIds) ? gameIds : [gameIds];
  const isSingleGame = !Array.isArray(gameIds);

  const [gameDetails, setGameDetails] = useState<Map<string, GameDetails>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  
  const processedGameIdsRef = useRef<Set<string>>(new Set());
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Filter out already processed game IDs
    const newGameIds = normalizedGameIds.filter(id => 
      id && !processedGameIdsRef.current.has(id)
    );
    
    if (newGameIds.length === 0) return;

    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Batch process with configurable delay
    processingTimeoutRef.current = setTimeout(async () => {
      if (newGameIds.length === 0) return;

      setIsLoading(true);
      setErrors(new Map()); // Clear previous errors
      
      try {
        console.log(`🚀 Unified bulk fetching ${newGameIds.length} game details (validation: ${enableValidation})`);
        
        // Mark all as processed immediately to prevent duplicate requests
        newGameIds.forEach(id => processedGameIdsRef.current.add(id));
        
        // Choose service based on validation preference
        const results = enableValidation 
          ? await EnhancedBulkGameService.fetchValidatedGameDetails(newGameIds)
          : await BulkGameService.fetchBulkGameDetails(newGameIds);
        
        // Update state with all results at once
        setGameDetails(prevDetails => {
          const newMap = new Map(prevDetails);
          Object.entries(results).forEach(([gameId, details]) => {
            newMap.set(gameId, details as GameDetails);
          });
          return newMap;
        });
        
        console.log(`✅ Successfully loaded ${Object.keys(results).length} game details`);
        
      } catch (error) {
        console.error('Failed to fetch unified game details:', error);
        
        // Handle retries for failed games
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        newGameIds.forEach(gameId => {
          const currentRetries = retryCountRef.current.get(gameId) || 0;
          
          if (currentRetries < maxRetries) {
            // Remove from processed list for retry
            processedGameIdsRef.current.delete(gameId);
            retryCountRef.current.set(gameId, currentRetries + 1);
            
            // Schedule retry with exponential backoff
            setTimeout(() => {
              // Trigger re-fetch by updating a dummy state
              setGameDetails(prev => new Map(prev));
            }, Math.pow(2, currentRetries) * 1000);
            
          } else {
            // Max retries reached, add error state
            setErrors(prevErrors => {
              const newErrors = new Map(prevErrors);
              newErrors.set(gameId, errorMessage);
              return newErrors;
            });
            
            // Add fallback data
            setGameDetails(prevDetails => {
              const newMap = new Map(prevDetails);
              newMap.set(gameId, {
                name: `Game ${gameId.replace('igdb_', '')} (Error)`,
                cover_url: undefined,
                developer: "Error loading data",
                publisher: "Error loading data",
                genres: ["Error"],
                release_date: undefined,
                isValidated: false,
                validationReason: 'max_retries_exceeded'
              });
              return newMap;
            });
          }
        });
        
      } finally {
        setIsLoading(false);
      }
    }, batchDelay);

  }, [normalizedGameIds.join(','), enableValidation, batchDelay, maxRetries]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Helper functions
  const getGameDetails = (gameId: string): GameDetails | undefined => {
    return gameDetails.get(gameId);
  };

  const isGameLoading = (gameId: string): boolean => {
    return isLoading && !gameDetails.has(gameId);
  };

  const getGameError = (gameId: string): string | undefined => {
    return errors.get(gameId);
  };

  const hasValidationData = (gameId: string): boolean => {
    const details = gameDetails.get(gameId);
    return details?.isValidated === true;
  };

  const getValidationStatus = (gameId: string): {
    isValidated: boolean;
    reason?: string;
    lastValidated?: number;
  } => {
    const details = gameDetails.get(gameId);
    return {
      isValidated: details?.isValidated || false,
      reason: details?.validationReason,
      lastValidated: details?.lastValidated
    };
  };

  // Return values optimized for both single and bulk usage
  if (isSingleGame) {
    const gameId = normalizedGameIds[0];
    return {
      // Single game interface
      game: getGameDetails(gameId),
      isLoading: isGameLoading(gameId),
      error: getGameError(gameId),
      
      // Validation info
      isValidated: hasValidationData(gameId),
      validationStatus: getValidationStatus(gameId),
      
      // Utility functions
      retry: () => {
        processedGameIdsRef.current.delete(gameId);
        retryCountRef.current.delete(gameId);
        setGameDetails(prev => new Map(prev)); // Trigger re-fetch
      }
    };
  } else {
    return {
      // Bulk interface
      gameDetails,
      games: gameDetails, // Alias for consistency
      isLoadingAny: isLoading,
      errors,
      
      // Individual game helpers
      getGame: getGameDetails,
      isGameLoading,
      getGameError,
      hasValidationData,
      getValidationStatus,
      
      // Bulk operations
      getAllGames: () => Array.from(gameDetails.values()),
      getValidatedGames: () => Array.from(gameDetails.values()).filter(g => g.isValidated),
      getFailedGames: () => Array.from(errors.keys()),
      
      // Utility functions
      retryGame: (gameId: string) => {
        processedGameIdsRef.current.delete(gameId);
        retryCountRef.current.delete(gameId);
        setGameDetails(prev => new Map(prev));
      },
      retryAll: () => {
        processedGameIdsRef.current.clear();
        retryCountRef.current.clear();
        setGameDetails(new Map());
        setErrors(new Map());
      }
    };
  }
}

// Convenience hooks for specific use cases
export function useSingleGameDetails(gameId: string, enableValidation: boolean = false) {
  return useUnifiedGameDetails(gameId, { enableValidation });
}

export function useBulkGameDetails(gameIds: string[], enableValidation: boolean = false) {
  return useUnifiedGameDetails(gameIds, { enableValidation });
}

export function useValidatedGameDetails(gameIds: string | string[]) {
  return useUnifiedGameDetails(gameIds, { enableValidation: true });
}