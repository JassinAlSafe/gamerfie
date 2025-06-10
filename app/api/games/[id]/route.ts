import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Game details API called for ID:', params.id);

    const [gameDetails, achievements, relatedGames] = await Promise.all([
      IGDBService.fetchGameDetails(params.id),
      IGDBService.fetchGameAchievements(params.id),
      IGDBService.fetchRelatedGames(params.id)
    ]);

    if (!gameDetails) {
      console.log('No game details found for ID:', params.id);
      return new NextResponse('Game not found', { status: 404 });
    }

    console.log('Game details fetched successfully:', {
      id: gameDetails.id,
      name: gameDetails.name,
      hasCover: !!gameDetails.cover_url,
      hasBackground: !!gameDetails.background_image,
      achievementsCount: achievements?.length || 0,
      relatedGamesCount: relatedGames?.length || 0
    });

    const response = {
      ...gameDetails,
      achievements: achievements || [],
      relatedGames: relatedGames || []
    };

    return NextResponse.json(response);
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