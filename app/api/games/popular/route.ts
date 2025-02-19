import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export async function GET() {
  try {
    const games = await IGDBService.getPopularGames(10);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error in popular games API:', error);
    return NextResponse.json({ error: 'Failed to fetch popular games' }, { status: 500 });
  }
}