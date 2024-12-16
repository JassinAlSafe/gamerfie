import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getIGDBToken } from '@/lib/igdb';

export const dynamic = 'force-dynamic';

async function fetchGamesFromIGDB(accessToken: string, query: string) {
  try {
    if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_TWITCH_CLIENT_ID is not configured');
    }

    console.log('Fetching from IGDB with query:', query);
    
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`IGDB API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} games from IGDB`);
    return data;
  } catch (error) {
    console.error('Error in fetchGamesFromIGDB:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Starting /api/games/popular request');
    
    const accessToken = await getIGDBToken();
    if (!accessToken) {
      console.error('Failed to get IGDB access token');
      return NextResponse.json({ error: 'Failed to get IGDB access token' }, { status: 500 });
    }

    console.log('Successfully obtained IGDB access token');
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const oneYearFromNow = currentTimestamp + (365 * 24 * 60 * 60);
    const thirtyDaysAgo = currentTimestamp - (30 * 24 * 60 * 60);
    const ninetyDaysAgo = currentTimestamp - (90 * 24 * 60 * 60);
    
    // Common fields for all queries
    const baseFields = 'fields name, cover.url, rating, total_rating_count, genres.name, platforms.name, category, first_release_date, hypes, follows, aggregated_rating, aggregated_rating_count;';
    
    // Common conditions
    const baseConditions = 'where version_parent = null & category = 0';
    
    try {
      // Fetch different categories of games
      const [topRated, newReleases, upcoming, trending] = await Promise.all([
        // Top rated games (high rating, many reviews)
        fetchGamesFromIGDB(accessToken, `${baseFields} ${baseConditions} & rating != null & cover != null & total_rating_count > 100; sort rating desc; limit 15;`),
        
        // New releases (released in last 30 days)
        fetchGamesFromIGDB(accessToken, `${baseFields} ${baseConditions} & cover != null & first_release_date >= ${thirtyDaysAgo} & first_release_date <= ${currentTimestamp}; sort first_release_date desc; limit 15;`),
        
        // Upcoming games (release date in future)
        fetchGamesFromIGDB(accessToken, `${baseFields} ${baseConditions} & cover != null & first_release_date >= ${currentTimestamp} & first_release_date <= ${oneYearFromNow}; sort first_release_date asc; limit 15;`),
        
        // Trending (good rating, recent activity)
        fetchGamesFromIGDB(accessToken, `${baseFields} ${baseConditions} & cover != null & first_release_date >= ${ninetyDaysAgo} & first_release_date <= ${currentTimestamp} & (rating >= 70 | aggregated_rating >= 70); sort total_rating_count desc; limit 15;`)
      ]);

      console.log('Successfully fetched all game categories');

      // Process all games data
      const processGames = (games: any[]) => {
        if (!Array.isArray(games)) {
          console.error('Received non-array games data:', games);
          return [];
        }
        
        return games.map(game => ({
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
          })) || [],
          first_release_date: game.first_release_date,
          hypes: game.hypes || 0,
          follows: game.follows || 0,
          aggregated_rating: game.aggregated_rating ? Math.round(game.aggregated_rating) : null,
          aggregated_rating_count: game.aggregated_rating_count || null
        }));
      };

      const result = {
        topRated: processGames(topRated),
        newReleases: processGames(newReleases),
        upcoming: processGames(upcoming),
        trending: processGames(trending)
      };

      console.log('Successfully processed all game data');
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching game categories:', error);
      return NextResponse.json(
        { error: 'Error fetching game categories', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
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