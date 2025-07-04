import { IGDBService } from '@/services/igdb';
import { NextResponse } from 'next/server';

// Force dynamic rendering due to external API calls
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch platforms and genres from IGDB
    const [platforms, genres] = await Promise.all([
      IGDBService.getPlatforms(),
      IGDBService.getGenres()
    ]);

    return NextResponse.json({
      platforms,
      genres
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch metadata' }),
      { status: 500 }
    );
  }
} 