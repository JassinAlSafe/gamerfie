import { NextRequest, NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const platform = searchParams.get('platform');
    const genre = searchParams.get('genre');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating';
    const search = searchParams.get('search') || '';

    // Build IGDB filters based on parameters
    const filters: any = {
      page,
      limit,
      search: search.trim(),
      sortBy: sort
    };

    // Add platform filter if specified
    if (platform && platform !== 'all') {
      filters.platform = platform;
    }

    // Add genre filter if specified
    if (genre && genre !== 'all') {
      filters.genre = genre;
    }

    // Add category-specific filters
    if (category && category !== 'all') {
      switch (category) {
        case 'recent':
          filters.timeRange = 'recent';
          break;
        case 'upcoming':
          filters.timeRange = 'upcoming';
          break;
        case 'popular':
          filters.sortBy = 'popularity';
          break;
        case 'classic':
          filters.timeRange = 'classic';
          break;
        case 'indie':
          filters.isIndie = true;
          break;
        case 'anticipated':
          filters.isAnticipated = true;
          break;
      }
    }

    const response = await IGDBService.getGames(page, limit, filters);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in games API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch games' },
      { status: 500 }
    );
  }
}