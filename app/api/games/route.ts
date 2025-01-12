import { NextRequest, NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

interface GameFilters {
  page: number;
  limit: number;
  search: string;
  sortBy: 'popularity' | 'rating' | 'name' | 'release';
  platformId?: number;
  genreId?: number;
  releaseYear?: {
    start: number;
    end: number;
  };
  timeRange?: 'new_releases' | 'upcoming' | 'classic';
  isIndie?: boolean;
  isAnticipated?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const platform = searchParams.get('platform');
    const genre = searchParams.get('genre');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const sort = searchParams.get('sort') || 'popularity';
    const search = searchParams.get('search') || '';

    // Build IGDB filters based on parameters
    const filters: GameFilters = {
      page,
      limit,
      search: search.trim(),
      sortBy: sort as GameFilters['sortBy']
    };

    // Add platform filter if specified
    if (platform && platform !== 'all') {
      filters.platformId = parseInt(platform);
    }

    // Add genre filter if specified
    if (genre && genre !== 'all') {
      filters.genreId = parseInt(genre);
    }

    // Add year filter if specified
    if (year && year !== 'all') {
      const yearStart = new Date(`${year}-01-01`).getTime() / 1000;
      const yearEnd = new Date(`${year}-12-31`).getTime() / 1000;
      filters.releaseYear = {
        start: yearStart,
        end: yearEnd
      };
    }

    // Add category-specific filters
    if (category && category !== 'all') {
      switch (category) {
        case 'recent':
          filters.timeRange = 'new_releases';
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