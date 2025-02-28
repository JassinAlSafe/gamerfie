import { NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';
import { Game } from '@/types/game';

interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  rating?: number;
  first_release_date?: number;
  platforms?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
  summary?: string;
  storyline?: string;
  screenshots?: Array<{
    id: number;
    url: string;
    image_id: string;
  }>;
  videos?: Array<{
    id: number;
    name: string;
    video_id: string;
  }>;
}

const validateIds = (ids: unknown): string[] => {
  const errors: string[] = [];
  
  if (!ids) {
    errors.push('Game IDs are required');
  } else if (!Array.isArray(ids)) {
    errors.push('Game IDs must be an array');
  } else if (ids.length === 0) {
    errors.push('At least one game ID is required');
  } else if (ids.length > 50) {
    errors.push('Maximum of 50 game IDs allowed');
  } else if (!ids.every(id => typeof id === 'string' || typeof id === 'number')) {
    errors.push('All game IDs must be strings or numbers');
  }
  
  return errors;
};

export async function POST(request: Request) {
  try {
    console.log('Starting /api/games/details request');
    const { ids } = await request.json();
    console.log('Received IDs:', ids);
    
    const validationErrors = validateIds(ids);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Fetch games directly from IGDB
    const igdbHeaders = await IGDBService.getHeaders();
    
    // Log the actual request body for debugging
    const requestBody = `
      fields name, cover.*, cover.url, cover.image_id, first_release_date, rating, genres.name, platforms.name, summary, storyline, screenshots.*, videos.*;
      where id = (${ids.join(',')});
    `;
    console.log('IGDB request body:', requestBody);
    
    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: igdbHeaders,
      body: requestBody
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API error response:', {
        status: igdbResponse.status,
        statusText: igdbResponse.statusText,
        body: errorText
      });

      // Check for specific error cases
      if (igdbResponse.status === 401) {
        throw new Error('IGDB authentication failed - check API credentials');
      } else if (igdbResponse.status === 429) {
        throw new Error('IGDB rate limit exceeded');
      } else {
        throw new Error(`IGDB API error: ${igdbResponse.status} ${igdbResponse.statusText} - ${errorText}`);
      }
    }

    const games: IGDBGame[] = await igdbResponse.json();
    console.log('Fetched games from IGDB:', {
      count: games.length,
      games: games.map(g => ({ id: g.id, name: g.name }))
    });

    // Process the games to match our expected format
    const processedGames: Game[] = games.map(game => ({
      id: game.id.toString(),
      name: game.name,
      cover_url: game.cover?.url ? (
        game.cover.url.startsWith('//') 
          ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
          : game.cover.url.startsWith('https:') 
            ? game.cover.url.replace('t_thumb', 't_cover_big')
            : `https://${game.cover.url.replace('t_thumb', 't_cover_big')}`
      ) : null,
      cover: game.cover ? {
        id: game.cover.id.toString(),
        url: game.cover.url.startsWith('//') 
          ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
          : game.cover.url.startsWith('https:') 
            ? game.cover.url.replace('t_thumb', 't_cover_big')
            : `https://${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined,
      rating: game.rating || 0,
      first_release_date: game.first_release_date,
      platforms: game.platforms?.map(p => ({
        id: p.name,
        name: p.name
      })) || [],
      genres: game.genres?.map(g => ({
        id: g.name,
        name: g.name
      })) || [],
      summary: game.summary || undefined,
      storyline: game.storyline || undefined,
      screenshots: game.screenshots?.map(screenshot => ({
        id: screenshot.id.toString(),
        url: screenshot.url?.startsWith('//') 
          ? `https:${screenshot.url}`
          : screenshot.url?.startsWith('https:') 
            ? screenshot.url
            : `https://${screenshot.url}`
      })) || [],
      videos: game.videos?.map(video => ({
        id: video.id.toString(),
        name: video.name || 'Game Trailer',
        url: `https://www.youtube.com/watch?v=${video.video_id}`,
        thumbnail_url: `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
        video_id: video.video_id,
        provider: 'youtube'
      })) || []
    }));

    // Add cache headers (1 hour for game details)
    const responseHeaders = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      'Vary': 'Accept-Encoding'
    };

    return NextResponse.json(processedGames, { headers: responseHeaders });
  } catch (error) {
    console.error('Error in /api/games/details:', error);
    
    if (error instanceof Error) {
      // Handle authentication errors
      if (error.message.includes('TWITCH_CLIENT_ID') || error.message.includes('TWITCH_CLIENT_SECRET')) {
        return NextResponse.json(
          { error: 'IGDB authentication configuration error. Please check your environment variables.' },
          { status: 500 }
        );
      }
      
      // Handle IGDB authentication failures
      if (error.message.includes('authentication failed')) {
        return NextResponse.json(
          { error: 'Failed to authenticate with IGDB. Please check your API credentials.' },
          { status: 500 }
        );
      }

      // Handle rate limiting errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
