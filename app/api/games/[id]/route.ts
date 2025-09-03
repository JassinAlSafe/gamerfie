import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';
import { RAWGService } from '@/services/rawgService';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const gameId = params.id;
    console.log('🎮 Game details API called for ID:', gameId, {
      hasIgdbPrefix: gameId.startsWith('igdb_'),
      hasRawgPrefix: gameId.startsWith('rawg_'),
      isNumeric: /^\d+$/.test(gameId),
      timestamp: new Date().toISOString()
    });

    let gameDetails: any = null;
    let rawgData: any = null;
    const errors: string[] = [];

    // For game details, we should prioritize IGDB for clean metadata and proper covers
    // But also get RAWG data for extra info like screenshots, ratings, reviews

    if (gameId.startsWith('igdb_')) {
      const actualId = gameId.replace('igdb_', '');
      console.log(`Using IGDB for game ID: ${actualId}`);
      
      try {
        // Add timeout protection for production
        const igdbPromise = IGDBService.fetchGameDetails(actualId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('IGDB request timeout')), 15000)
        );
        
        gameDetails = await Promise.race([igdbPromise, timeoutPromise]);
        
        if (gameDetails) {
          gameDetails.id = gameId; // Keep the prefixed ID
          gameDetails.dataSource = 'igdb';
          console.log(`✅ IGDB fetch successful for ${gameId} in ${Date.now() - startTime}ms`);
        }
      } catch (igdbError) {
        const errorMsg = `IGDB failed for ${gameId}: ${igdbError instanceof Error ? igdbError.message : String(igdbError)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        
        // Production fallback: return a minimal game object to prevent 500 errors
        gameDetails = {
          id: gameId,
          name: `Game ${actualId}`,
          summary: 'Game details temporarily unavailable. Please try again later.',
          dataSource: 'fallback',
          error: 'IGDB service temporarily unavailable'
        };
      }
    } else if (gameId.startsWith('rawg_')) {
      const actualId = gameId.replace('rawg_', '');
      console.log(`Getting RAWG basic data for ID: ${actualId}`);
      
      try {
        // Add timeout protection
        const rawgPromise = RAWGService.getGameDetails(actualId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RAWG request timeout')), 12000)
        );
        
        rawgData = await Promise.race([rawgPromise, timeoutPromise]);
        
        if (rawgData) {
          // Try to find IGDB equivalent by name for better metadata and covers
          console.log(`Searching IGDB for: ${rawgData.name}`);
          try {
            const igdbPromise = IGDBService.getGames(1, 5, { 
              page: 1,
              limit: 5,
              search: rawgData.name,
              sortBy: 'popularity'
            });
            const igdbTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('IGDB search timeout')), 10000)
            );
            
            const igdbSearchResults = await Promise.race([igdbPromise, igdbTimeoutPromise]);
            
            if (igdbSearchResults.games.length > 0) {
              // Find the best match by name similarity
              const bestMatch = igdbSearchResults.games.find(igdbGame => 
                igdbGame.name.toLowerCase() === rawgData.name.toLowerCase()
              ) || igdbSearchResults.games[0]; // Fallback to first result
              
              console.log(`Found IGDB match: ${bestMatch.name}`);
              
              // Use IGDB data for clean metadata and covers, but keep RAWG ID and extras
              gameDetails = {
                ...bestMatch,
                id: gameId, // Keep the RAWG prefixed ID
                // Keep some RAWG data for additional context
                background_image: rawgData.background_image,
                metacritic: rawgData.metacritic || (bestMatch as any).metacritic,
                dataSource: 'hybrid', // Mark as hybrid data
                rawg_rating: rawgData.rating,
                rawg_rating_count: rawgData.total_rating_count,
                // Ensure we have proper cover from IGDB
                cover_url: (bestMatch as any).cover_url || bestMatch.cover?.url,
              };
            } else {
              console.log('No IGDB match found, using RAWG data only');
              gameDetails = {
                ...rawgData,
                id: gameId,
                dataSource: 'rawg'
              };
            }
          } catch (igdbError) {
            const errorMsg = `IGDB search failed for ${rawgData.name}: ${igdbError instanceof Error ? igdbError.message : String(igdbError)}`;
            console.log(errorMsg);
            errors.push(errorMsg);
            gameDetails = {
              ...rawgData,
              id: gameId,
              dataSource: 'rawg'
            };
          }
        }
      } catch (rawgError) {
        const errorMsg = `RAWG failed for ${gameId}: ${rawgError instanceof Error ? rawgError.message : String(rawgError)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        
        // Fallback for RAWG failure
        gameDetails = {
          id: gameId,
          name: `Game ${actualId}`,
          summary: 'Game details temporarily unavailable from RAWG service.',
          dataSource: 'fallback',
          error: 'RAWG service temporarily unavailable'
        };
      }
    } else {
      // For unprefixed IDs, prioritize IGDB since most game data comes from IGDB
      console.log(`Trying IGDB first for unprefixed ID: ${gameId}`);
      
      try {
        // Try IGDB first since our reviews mostly use IGDB IDs
        const igdbPromise = IGDBService.fetchGameDetails(gameId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('IGDB request timeout')), 15000)
        );
        
        gameDetails = await Promise.race([igdbPromise, timeoutPromise]);
        if (gameDetails) {
          gameDetails.id = gameId; // Keep the unprefixed ID for consistency
          gameDetails.dataSource = 'igdb';
          console.log(`✅ IGDB found game for ID ${gameId}: ${gameDetails.name}`);
        }
      } catch (igdbError) {
        const igdbErrorMsg = `IGDB failed for ID ${gameId}: ${igdbError instanceof Error ? igdbError.message : String(igdbError)}`;
        console.log(igdbErrorMsg);
        errors.push(igdbErrorMsg);
        
        try {
          // Fallback to RAWG if IGDB fails
          const rawgPromise = RAWGService.getGameDetails(gameId);
          const rawgTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('RAWG request timeout')), 12000)
          );
          
          rawgData = await Promise.race([rawgPromise, rawgTimeoutPromise]);
          if (rawgData) {
            console.log(`✅ RAWG found fallback data for ${gameId}: ${rawgData.name}`);
            
            // Then try to find IGDB equivalent for better metadata (with timeout)
            try {
              const igdbSearchPromise = IGDBService.getGames(1, 1, { 
                page: 1,
                limit: 1,
                search: rawgData.name,
                sortBy: 'popularity'
              });
              const searchTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('IGDB search timeout')), 8000)
              );
              
              const igdbSearchResults = await Promise.race([igdbSearchPromise, searchTimeoutPromise]);
              
              if (igdbSearchResults.games.length > 0) {
                const igdbGame = igdbSearchResults.games[0];
                gameDetails = {
                  ...igdbGame,
                  id: gameId,
                  background_image: rawgData.background_image,
                  metacritic: rawgData.metacritic || (igdbGame as any).metacritic,
                  dataSource: 'hybrid',
                  rawg_rating: rawgData.rating,
                  rawg_rating_count: rawgData.total_rating_count,
                };
                console.log(`✅ Created hybrid data with IGDB metadata for ${gameId}`);
              } else {
                gameDetails = {
                  ...rawgData,
                  id: gameId,
                  dataSource: 'rawg'
                };
                console.log(`✅ Using RAWG data only for ${gameId}`);
              }
            } catch (searchError) {
              const searchErrorMsg = `IGDB search failed for ${rawgData.name}: ${searchError instanceof Error ? searchError.message : String(searchError)}`;
              console.log(searchErrorMsg);
              errors.push(searchErrorMsg);
              gameDetails = {
                ...rawgData,
                id: gameId,
                dataSource: 'rawg'
              };
            }
          }
        } catch (rawgError) {
          const rawgErrorMsg = `RAWG also failed for ID ${gameId}: ${rawgError instanceof Error ? rawgError.message : String(rawgError)}`;
          console.log(rawgErrorMsg);
          errors.push(rawgErrorMsg);
          
          // Final fallback when both services fail
          gameDetails = {
            id: gameId,
            name: `Game ${gameId}`,
            summary: 'Game details are currently unavailable due to temporary service issues.',
            dataSource: 'fallback',
            error: 'Both IGDB and RAWG services temporarily unavailable'
          };
        }
      }
    }

    if (!gameDetails) {
      console.log('No game details found for ID:', gameId);
      
      // Instead of 404, return a fallback game object for better UX
      const fallbackGame = {
        id: gameId,
        name: `Game ${gameId.replace(/^(igdb_|rawg_)/, '')}`,
        summary: 'Game details are currently unavailable. This might be due to temporary service issues or the game not being found in our databases.',
        dataSource: 'fallback',
        error: 'Game not found or service unavailable',
        cover_url: null,
        first_release_date: null,
        genres: [],
        platforms: [],
        screenshots: [],
        videos: [],
        rating: null,
        total_rating: null
      };
      
      console.log('📄 Returning fallback game object for better UX');
      return NextResponse.json(fallbackGame, { status: 200 });
    }

    const responseTime = Date.now() - startTime;
    console.log('✅ Game details fetched successfully:', {
      originalRequestId: gameId,
      returnedId: gameDetails.id,
      name: gameDetails.name,
      dataSource: gameDetails.dataSource,
      hasCover: !!gameDetails.cover_url || !!gameDetails.cover,
      coverUrl: gameDetails.cover_url || gameDetails.cover?.url || 'none',
      responseTime: `${responseTime}ms`,
      hasErrors: errors.length > 0,
      errorCount: errors.length
    });

    // Add response headers for better caching and debugging
    const response = NextResponse.json(gameDetails);
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Data-Source', gameDetails.dataSource || 'unknown');
    
    if (errors.length > 0) {
      response.headers.set('X-Partial-Errors', errors.length.toString());
    }

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error in game details route:', error);
    
    // Return a more user-friendly error response instead of 500
    const fallbackGame = {
      id: params.id,
      name: `Game ${params.id.replace(/^(igdb_|rawg_)/, '')}`,
      summary: 'Unable to load game details at this time. Please try again later or contact support if the issue persists.',
      dataSource: 'error-fallback',
      error: error instanceof Error ? error.message : 'Unknown server error',
      cover_url: null,
      first_release_date: null,
      genres: [],
      platforms: [],
      screenshots: [],
      videos: [],
      rating: null,
      total_rating: null
    };
    
    const response = NextResponse.json(fallbackGame, { status: 200 });
    response.headers.set('X-Error-Fallback', 'true');
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    
    return response;
  }
} 