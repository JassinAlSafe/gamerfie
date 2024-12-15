import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getIGDBToken } from '@/lib/igdb';

export const dynamic = 'force-dynamic';

async function fetchGamesFromIGDB(accessToken: string, query: string) {
  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${accessToken}`,
    },
    body: query,
  });

  if (!response.ok) {
    console.error('IGDB API error:', await response.text());
    throw new Error('Failed to fetch games from IGDB');
  }

  return response.json();
}

export async function GET() {
  try {
    console.log('Starting /api/games/popular request');
    
    const accessToken = await getIGDBToken();
    
    // Common fields and conditions for all queries
    const baseFields = 'fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, category;';
    const baseConditions = 'where rating != null & cover != null & version_parent = null & category = 0';
    
    // Fetch different categories of games
    const [topRated, newReleases, upcoming, trending] = await Promise.all([
      // Top rated games (high rating, many reviews)
      fetchGamesFromIGDB(accessToken, `
        ${baseFields}
        ${baseConditions} & total_rating_count > 1000;
        sort rating desc;
        limit 15;
      `),
      
      // New releases (released in last 30 days)
      fetchGamesFromIGDB(accessToken, `
        ${baseFields}
        ${baseConditions} & first_release_date >= ${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)};
        sort first_release_date desc;
        limit 15;
      `),
      
      // Upcoming games (release date in future)
      fetchGamesFromIGDB(accessToken, `
        ${baseFields}
        ${baseConditions} & first_release_date >= ${Math.floor(Date.now() / 1000)};
        sort first_release_date asc;
        limit 15;
      `),
      
      // Trending (good rating, recent activity)
      fetchGamesFromIGDB(accessToken, `
        ${baseFields}
        ${baseConditions} & total_rating_count > 100 & first_release_date >= ${Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)};
        sort rating desc;
        limit 15;
      `)
    ]);

    // Process all games data
    const processGames = (games: any[]) => games.map(game => ({
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : null,
      rating: typeof game.rating === 'number' ? Math.round(game.rating) : null,
      total_rating_count: game.total_rating_count || null,
      genres: game.genres?.map((genre: any) => ({
        id: genre.id,
        name: genre.name
      })) || [],
      platforms: game.platforms?.map((platform: any) => ({
        id: platform.id,
        name: platform.name
      })) || []
    }));

    const result = {
      topRated: processGames(topRated),
      newReleases: processGames(newReleases),
      upcoming: processGames(upcoming),
      trending: processGames(trending)
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error in /api/games/popular:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 