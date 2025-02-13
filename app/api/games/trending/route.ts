import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export async function GET() {
  try {
    const games = await IGDBService.getTrendingGames(10);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error in trending games API:', error);
    return NextResponse.json({ error: 'Failed to fetch trending games' }, { status: 500 });
  }
}
