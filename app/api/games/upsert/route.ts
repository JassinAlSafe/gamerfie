import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get game data from request
    const gameData = await request.json();

    // Insert or update the game using server-side client
    const { error: gameError } = await supabase
      .from('games')
      .upsert(gameData, { 
        onConflict: 'id'
      });

    if (gameError) {
      console.error('Error upserting game:', gameError);
      return new NextResponse(gameError.message, { status: 500 });
    }

    return new NextResponse('Game updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error in games/upsert:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 