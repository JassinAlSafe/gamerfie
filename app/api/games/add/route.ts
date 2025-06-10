import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { getIGDBToken } from '../../lib-exports';

export async function POST(request: Request) {
  try {
    const { gameId, userId } = await request.json();
    
    const supabase = await createClient();

    // First check if game exists in our games table
    const { data: existingGame } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!existingGame) {
      // Fetch game details from IGDB
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
          where id = ${gameId};
        `
      });

      if (!igdbResponse.ok) {
        throw new Error('Failed to fetch game details from IGDB');
      }

      const [igdbGame] = await igdbResponse.json();
      
      // Insert game into our games table
      const { error: insertError } = await supabase
        .from('games')
        .insert({
          id: gameId,
          name: igdbGame.name,
          cover: igdbGame.cover ? {
            id: igdbGame.cover.id,
            url: igdbGame.cover.url
          } : null,
          rating: igdbGame.rating,
          first_release_date: igdbGame.first_release_date,
          platforms: igdbGame.platforms,
          genres: igdbGame.genres,
          summary: igdbGame.summary,
          storyline: igdbGame.storyline
        });

      if (insertError) throw insertError;
    }

    // Add user-game relationship
    const { error: userGameError } = await supabase
      .from('user_games')
      .upsert({
        user_id: userId,
        game_id: gameId,
        status: 'want_to_play'
      });

    if (userGameError) throw userGameError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/games/add:', error);
    return NextResponse.json(
      { error: 'Failed to add game' },
      { status: 500 }
    );
  }
} 