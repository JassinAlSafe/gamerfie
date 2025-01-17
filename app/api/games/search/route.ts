'use server';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ games: [] });
  }

  try {
    const supabase = createClientComponentClient();
    const { data: games, error } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ games: games || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    );
  }
} 