import { NextRequest, NextResponse } from 'next/server';
import { IGDBService } from '@/services/igdb';

export type GameCategory = 'all' | 'recent' | 'upcoming' | 'popular' | 'classic' | 'indie' | 'anticipated';
export type GameSortOption = 'popularity' | 'rating' | 'name' | 'release';

interface GameFilters {
  page: number;
  limit: number;
  search: string;
  sortBy: GameSortOption;
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

const validateParams = (params: URLSearchParams) => {
  const errors: string[] = [];
  
  // Validate page and limit
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '24');
  if (isNaN(page) || page < 1) errors.push('Invalid page number');
  if (isNaN(limit) || limit < 1 || limit > 100) errors.push('Invalid limit (1-100)');

  // Validate sort
  const sort = params.get('sort') || 'popularity';
  const validSorts: GameSortOption[] = ['popularity', 'rating', 'name', 'release'];
  if (!validSorts.includes(sort as GameSortOption)) {
    errors.push(`Invalid sort option. Must be one of: ${validSorts.join(', ')}`);
  }

  // Validate platform and genre if provided
  const platform = params.get('platform');
  const genre = params.get('genre');
  if (platform && platform !== 'all' && isNaN(parseInt(platform))) {
    errors.push('Invalid platform ID');
  }
  if (genre && genre !== 'all' && isNaN(parseInt(genre))) {
    errors.push('Invalid genre ID');
  }

  // Validate category
  const category = params.get('category');
  const validCategories: GameCategory[] = ['all', 'recent', 'upcoming', 'popular', 'classic', 'indie', 'anticipated'];
  if (category && !validCategories.includes(category as GameCategory)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  return errors;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate parameters
    const validationErrors = validateParams(searchParams);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { errors: validationErrors },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const platform = searchParams.get('platform');
    const genre = searchParams.get('genre');
    const category = searchParams.get('category') as GameCategory;
    const year = searchParams.get('year');
    const sort = (searchParams.get('sort') || 'popularity') as GameSortOption;
    const search = searchParams.get('search') || '';

    // Build IGDB filters based on parameters
    const filters: GameFilters = {
      page,
      limit,
      search: search.trim(),
      sortBy: sort
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

    // Add cache headers (5 minutes for normal requests, 1 hour for search requests)
    const maxAge = search ? 3600 : 300;
    const headers = {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
      'Vary': 'Accept-Encoding, x-search'
    };

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('Error in games API:', error);
    
    if (error instanceof Error) {
      // Handle rate limiting errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      
      // Handle service unavailability
      if (error.message.includes('service unavailable')) {
        return NextResponse.json(
          { error: 'Game service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch games' },
      { status: 500 }
    );
  }
}