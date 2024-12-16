import { NextResponse } from 'next/server';
import { fetchGameDetails, fetchGameAchievements, fetchRelatedGames } from '@/lib/igdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [gameDetails, achievements, relatedGames] = await Promise.all([
      fetchGameDetails(params.id),
      fetchGameAchievements(params.id),
      fetchRelatedGames(params.id)
    ]);

    if (!gameDetails) {
      return new NextResponse('Game not found', { status: 404 });
    }

    console.log(`Fetched ${achievements.length} achievements and ${relatedGames.length} related games for game ${params.id}`);

    const response = {
      ...gameDetails,
      achievements: achievements || [],
      relatedGames: relatedGames || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in game details route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch game details', details: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500 }
    );
  }
} 