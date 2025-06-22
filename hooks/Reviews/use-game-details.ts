import { useState, useEffect, useRef } from "react";
import { BulkGameService } from '@/services/bulkGameService';

interface GameDetails {
  name: string;
  cover_url?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  release_date?: string;
}

export function useGameDetails(gameIds: string[]) {
  const [gameDetails, setGameDetails] = useState<Map<string, GameDetails>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const processedGameIdsRef = useRef<Set<string>>(new Set());
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Filter out already processed game IDs
    const newGameIds = gameIds.filter(id => !processedGameIdsRef.current.has(id));
    
    if (newGameIds.length === 0) return;

    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Batch process with a very short delay to allow for more IDs to be added
    processingTimeoutRef.current = setTimeout(async () => {
      if (newGameIds.length === 0) return;

      setIsLoading(true);
      
      try {
        console.log(`🚀 Bulk fetching ${newGameIds.length} game details`);
        
        // Mark all as processed immediately to prevent duplicate requests
        newGameIds.forEach(id => processedGameIdsRef.current.add(id));
        
        // Fetch all game details in a single API call
        const bulkResults = await BulkGameService.fetchBulkGameDetails(newGameIds);
        
        // Update state with all results at once
        setGameDetails(prevDetails => {
          const newMap = new Map(prevDetails);
          Object.entries(bulkResults).forEach(([gameId, details]) => {
            newMap.set(gameId, details);
          });
          return newMap;
        });
        
        console.log(`✅ Successfully loaded ${Object.keys(bulkResults).length} game details`);
        
      } catch (error) {
        console.error('Failed to fetch bulk game details:', error);
        
        // Remove from processed list so they can be retried
        newGameIds.forEach(id => processedGameIdsRef.current.delete(id));
        
        // Add fallback data
        setGameDetails(prevDetails => {
          const newMap = new Map(prevDetails);
          newGameIds.forEach(gameId => {
            newMap.set(gameId, {
              name: `Game ${gameId.replace('igdb_', '')}`,
              cover_url: undefined,
              developer: "Unknown Developer",
              publisher: "Unknown Publisher",
              genres: ["Unknown"],
              release_date: undefined
            });
          });
          return newMap;
        });
      } finally {
        setIsLoading(false);
      }
    }, 50); // Very short delay to batch requests

  }, [gameIds]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameDetails,
    isLoadingAny: isLoading,
    isLoadingGame: (gameId: string) => isLoading && !gameDetails.has(gameId)
  };
}