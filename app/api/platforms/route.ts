import { NextResponse } from 'next/server';
import { GameService } from '@/services/gameService';

export async function GET() {
  try {
    const platforms = await GameService.fetchPlatforms();
    const response = NextResponse.json(platforms);
    
    // Add caching headers - 1 hour for platforms (rarely change)
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return response;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}