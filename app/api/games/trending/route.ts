import { NextResponse } from 'next/server';
import { UnifiedGameService } from '@/services/unifiedGameService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    console.log('API: Fetching trending games via unified service...', { limit });

    // Use unified service for trending games with IGDB priority
    const games = await UnifiedGameService.getTrendingGames(limit, 'auto');
    
    console.log('API: UnifiedGameService returned:', { 
      gamesCount: games?.length || 0, 
      hasGames: !!games && games.length > 0,
      firstGameId: games?.[0]?.id,
      firstGameName: games?.[0]?.name
    });
    
    if (!games || games.length === 0) {
      console.log('API: No trending games found from unified service');
      return NextResponse.json({ 
        games: [], 
        message: 'No trending games available at the moment',
        total: 0
      });
    }

    console.log(`Successfully fetched ${games.length} trending games from unified service`);
    
    return NextResponse.json({ 
      games: games,
      total: games.length,
      source: 'unified'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error in trending games API:', error);
    
    // Return an empty array instead of throwing to allow graceful degradation
    return NextResponse.json({ 
      games: [], 
      error: 'Trending games temporarily unavailable',
      message: 'Please try again later'
    }, { 
      status: 200  // Return 200 to allow frontend to handle gracefully
    });
  }
}
