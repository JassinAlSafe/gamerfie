import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Use the optimized popular_games view instead of complex queries
    const { data: popularGames, error } = await supabase
      .from('popular_games')
      .select('*')
      .order('total_users', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching popular games:', error);
      return NextResponse.json(
        { error: 'Failed to fetch popular games' },
        { status: 500 }
      );
    }

    // Transform the data to match expected format
    const transformedGames = popularGames?.map(game => ({
      id: game.id,
      name: game.name,
      cover_url: game.cover_url,
      rating: game.rating,
      total_rating_count: game.total_rating_count,
      first_release_date: game.first_release_date,
      platforms: game.platforms,
      genres: game.genres,
      summary: game.summary,
      storyline: game.storyline,
      stats: {
        user_count: game.total_users,
        avg_rating: game.avg_user_rating,
        completed_count: game.completed_count,
        currently_playing: game.currently_playing
      }
    })) || [];

    return NextResponse.json(transformedGames, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Popular games error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}