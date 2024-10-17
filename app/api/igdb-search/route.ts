import { NextResponse } from 'next/server';
import { getAccessToken, searchGames } from '@/lib/igdb';

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();
    
    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
    }

    const results = await searchGames(accessToken, searchTerm);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in IGDB search API route:', error);
    
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
      return NextResponse.json({ error: `IGDB API error: ${error.response.status}` }, { status: error.response.status });
    } else if (error.request) {
      console.error(error.request);
      return NextResponse.json({ error: 'No response received from IGDB API' }, { status: 500 });
    } else {
      console.error('Error', error.message);
      return NextResponse.json({ error: 'An error occurred while searching games' }, { status: 500 });
    }
  }
}