import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // First try exact match
    const { data: exactMatches, error: exactError } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .eq('name', query)
      .limit(5);

    if (exactError) {
      console.error('Error searching games (exact):', exactError);
      return NextResponse.json({ error: 'Failed to search games' }, { status: 500 });
    }

    // Then try partial matches
    const { data: partialMatches, error: partialError } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .ilike('name', `%${query}%`)
      .not('name', 'eq', query) // Exclude exact matches
      .order('name')
      .limit(10);

    if (partialError) {
      console.error('Error searching games (partial):', partialError);
      return NextResponse.json({ error: 'Failed to search games' }, { status: 500 });
    }

    // Combine results, with exact matches first
    const results = [...(exactMatches || []), ...(partialMatches || [])];
    return NextResponse.json(results);
  } catch (error) {
    console.error('Games search error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 