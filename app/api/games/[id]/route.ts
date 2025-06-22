import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';
import { RAWGService } from '@/services/rawgService';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    console.log('🎮 Game details API called for ID:', gameId, {
      hasIgdbPrefix: gameId.startsWith('igdb_'),
      hasRawgPrefix: gameId.startsWith('rawg_'),
      isNumeric: /^\d+$/.test(gameId)
    });

    let gameDetails: any = null;
    let rawgData: any = null;

    // For game details, we should prioritize IGDB for clean metadata and proper covers
    // But also get RAWG data for extra info like screenshots, ratings, reviews

    if (gameId.startsWith('igdb_')) {
      const actualId = gameId.replace('igdb_', '');
      console.log(`Using IGDB for game ID: ${actualId}`);
      gameDetails = await IGDBService.fetchGameDetails(actualId);
      if (gameDetails) {
        gameDetails.id = gameId; // Keep the prefixed ID
        gameDetails.dataSource = 'igdb';
      }
    } else if (gameId.startsWith('rawg_')) {
      const actualId = gameId.replace('rawg_', '');
      console.log(`Getting RAWG basic data for ID: ${actualId}`);
      rawgData = await RAWGService.getGameDetails(actualId);
      
      if (rawgData) {
        // Try to find IGDB equivalent by name for better metadata and covers
        console.log(`Searching IGDB for: ${rawgData.name}`);
        try {
          const igdbSearchResults = await IGDBService.getGames(1, 5, { 
            page: 1,
            limit: 5,
            search: rawgData.name,
            sortBy: 'popularity'
          });
          
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
        } catch (error) {
          console.log('IGDB search failed, using RAWG data only:', error);
          gameDetails = {
            ...rawgData,
            id: gameId,
            dataSource: 'rawg'
          };
        }
      }
    } else {
      // For unprefixed IDs, prioritize IGDB since most game data comes from IGDB
      console.log(`Trying IGDB first for unprefixed ID: ${gameId}`);
      
      try {
        // Try IGDB first since our reviews mostly use IGDB IDs
        gameDetails = await IGDBService.fetchGameDetails(gameId);
        if (gameDetails) {
          gameDetails.id = gameId; // Keep the unprefixed ID for consistency
          gameDetails.dataSource = 'igdb';
          console.log(`✅ IGDB found game for ID ${gameId}: ${gameDetails.name}`);
        }
      } catch (igdbError) {
        console.log(`IGDB failed for ID ${gameId}, trying RAWG:`, igdbError);
        try {
          // Fallback to RAWG if IGDB fails
          rawgData = await RAWGService.getGameDetails(gameId);
          if (rawgData) {
            // Then try to find IGDB equivalent for better metadata
            const igdbSearchResults = await IGDBService.getGames(1, 1, { 
              page: 1,
              limit: 1,
              search: rawgData.name,
              sortBy: 'popularity'
            });
            
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
            } else {
              gameDetails = {
                ...rawgData,
                id: gameId,
                dataSource: 'rawg'
              };
            }
          }
        } catch (rawgError) {
          console.log(`Both IGDB and RAWG failed for ID: ${gameId}`, { igdbError, rawgError });
        }
      }
    }

    if (!gameDetails) {
      console.log('No game details found for ID:', gameId);
      return new NextResponse('Game not found', { status: 404 });
    }

    console.log('✅ Game details fetched successfully:', {
      originalRequestId: gameId,
      returnedId: gameDetails.id,
      name: gameDetails.name,
      dataSource: gameDetails.dataSource,
      hasCover: !!gameDetails.cover_url || !!gameDetails.cover,
      coverUrl: gameDetails.cover_url || gameDetails.cover?.url || 'none'
    });

    return NextResponse.json(gameDetails);
  } catch (error) {
    console.error('Error in game details route:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch game details', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 