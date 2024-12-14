import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getIGDBToken } from '@/lib/igdb';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid game IDs' }, { status: 400 });
    }

    const supabase = createClientComponentClient();
    
    // Try to get games from our database first
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    // If we're missing any games, fetch them from IGDB
    if (!games || games.length < ids.length) {
      const missingIds = ids.filter(id => 
        !games?.some(game => game.id === id)
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
          throw new Error('Failed to fetch games from IGDB');
        }

        const igdbGames = await igdbResponse.json();
        
        // Transform and insert the IGDB games into our database
        const transformedGames = igdbGames.map((game: any) => ({
          id: game.id.toString(),
          name: game.name,
          cover: game.cover ? {
            id: game.cover.id,
            url: game.cover.url
          } : null,
          rating: game.rating,
          first_release_date: game.first_release_date,
          platforms: game.platforms,
          genres: game.genres,
          summary: game.summary,
          storyline: game.storyline
        }));

        await supabase
          .from('games')
          .upsert(transformedGames);

        // Combine with existing games
        games.push(...transformedGames);
      }
    }

    // Map the games to match the order of requested IDs
    const orderedGames = ids.map(id => 
      games.find(game => game.id === id)
    );

    return NextResponse.json(orderedGames);
  } catch (error) {
    console.error('Error in /api/games/details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
