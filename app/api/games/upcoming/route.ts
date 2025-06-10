import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export async function GET() {
  try {
    const games = await IGDBService.getUpcomingGames(10);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error in upcoming games API:', error);
    return NextResponse.json({ error: 'Failed to fetch upcoming games' }, { status: 500 });
  }
}
