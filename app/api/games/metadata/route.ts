import { NextResponse } from 'next/server';
import { getIGDBToken } from '@/lib/igdb';

interface IGDBPlatform {
  id: number;
  name: string;
  category: number;
}

interface IGDBGenre {
  id: number;
  name: string;
}

interface ProcessedPlatform {
  id: number;
  name: string;
}

export async function GET() {
  try {
    const token = await getIGDBToken();
    if (!token) {
      throw new Error('Failed to get IGDB access token');
    }

    const headers = {
      'Accept': 'application/json',
      'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
    };

    // Fetch platforms
    const platformsResponse = await fetch('https://api.igdb.com/v4/platforms', {
      method: 'POST',
      headers,
      body: `
        fields id, name, category;
        where category = (1,2,3,4,5,6);
        sort name asc;
        limit 500;
      `,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    // Fetch genres
    const genresResponse = await fetch('https://api.igdb.com/v4/genres', {
      method: 'POST',
      headers,
      body: `
        fields id, name;
        sort name asc;
        limit 500;
      `,
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!platformsResponse.ok || !genresResponse.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const [platforms, genres] = await Promise.all([
      platformsResponse.json(),
      genresResponse.json()
    ]);

    // Filter out duplicate platform names and process platforms
    const uniquePlatforms = platforms.reduce((acc: ProcessedPlatform[], platform: IGDBPlatform) => {
      if (!acc.find(p => p.name === platform.name)) {
        acc.push({
          id: platform.id,
          name: platform.name
        });
      }
      return acc;
    }, []);

    // Process genres
    const processedGenres = genres.map((genre: IGDBGenre) => ({
      id: genre.id,
      name: genre.name
    }));

    return NextResponse.json({
      platforms: uniquePlatforms,
      genres: processedGenres
    });
  } catch (error) {
    console.error('Error in metadata API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
} 