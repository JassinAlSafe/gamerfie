import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getIGDBToken } from '@/lib/igdb';
import { Database } from '@/types/supabase';
import { Game } from '@/types/game';

// Define transformed game type
type GameDetails = Database['public']['Tables']['games']['Row'];

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
    const { ids } = await request.json();
    
    const validationErrors = validateIds(ids);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    const supabase = createClientComponentClient<Database>();
    
    // Try to get games from our database first
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    // If we're missing any games, fetch them from IGDB
    const missingIds = ids.filter((id: string | number) => 
      !games?.some(game => game.id === id.toString())
    );

    if (missingIds.length > 0) {
      const token = await getIGDBToken();
      
      const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `
          fields name, cover.*, first_release_date, rating, genres.name, platforms.name, summary, storyline;
          where id = (${missingIds.join(',')});
        `
      });

      if (!igdbResponse.ok) {
        if (igdbResponse.status === 429) {
          throw new Error('rate limit exceeded');
        }
        throw new Error('Failed to fetch games from IGDB');
      }

      const igdbGames: Game[] = await igdbResponse.json();
      
      // Transform and insert the IGDB games into our database
      const transformedGames: GameDetails[] = igdbGames.map(game => ({
        id: game.id.toString(),
        name: game.name,
        cover_url: game.cover?.url || null,
        cover: game.cover ? {
          id: game.cover.id,
          url: game.cover.url
        } : null,
        rating: game.rating || null,
        first_release_date: game.first_release_date || null,
        platforms: game.platforms?.map(p => p.name) || null,
        genres: game.genres?.map(g => g.name) || null,
        summary: game.summary || null,
        storyline: game.storyline || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: upsertError } = await supabase
        .from('games')
        .upsert(transformedGames);

      if (upsertError) throw upsertError;

      // Combine with existing games
      games.push(...transformedGames);
    }

    // Map the games to match the order of requested IDs
    const orderedGames = ids.map((id: string | number) => 
      games.find(game => game.id === id.toString())
    );

    // Add cache headers (1 hour for game details)
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      'Vary': 'Accept-Encoding'
    };

    return NextResponse.json(orderedGames, { headers });
  } catch (error) {
    console.error('Error in /api/games/details:', error);
    
    if (error instanceof Error) {
      // Handle rate limiting errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      
      // Handle database errors
      if (error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Database error occurred. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
