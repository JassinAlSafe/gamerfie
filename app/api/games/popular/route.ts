import { NextResponse } from 'next/server';
import { UnifiedGameService } from '@/services/unifiedGameService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    console.log('Fetching popular games via unified service...', { limit });

    // Use unified service for popular games with IGDB priority
    const games = await UnifiedGameService.getPopularGames(limit, 'auto');
    
    if (!games || games.length === 0) {
      console.log('No popular games found from unified service');
      return NextResponse.json({
        games: [],
        message: 'No popular games available at the moment',
        total: 0
      });
    }

    console.log(`Successfully fetched ${games.length} popular games from unified service`);

    return NextResponse.json(games, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Popular games error:', error);
    
    // Return an empty array instead of throwing to allow graceful degradation
    return NextResponse.json({
      games: [],
      error: 'Popular games temporarily unavailable',
      message: 'Please try again later'
    }, { 
      status: 200  // Return 200 to allow frontend to handle gracefully
    });
  }
}