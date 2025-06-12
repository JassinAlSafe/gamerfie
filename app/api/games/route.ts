import { NextRequest, NextResponse } from 'next/server';
import { UnifiedGameService } from '@/services/unifiedGameService';

export type GameCategory = 'all' | 'recent' | 'upcoming' | 'popular' | 'trending' | 'classic' | 'indie' | 'anticipated';
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
  const validCategories: GameCategory[] = ['all', 'recent', 'upcoming', 'popular', 'trending', 'classic', 'indie', 'anticipated'];
  if (category && !validCategories.includes(category as GameCategory)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  return errors;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Log request parameters
    console.log('Games API request params:', Object.fromEntries(searchParams.entries()));
    
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

    console.log('Fetching games with unified service...');
    
    // Handle search queries using UnifiedGameService
    if (search.trim()) {
      console.log(`Searching for games with query: "${search}"`);
      
      const searchResult = await UnifiedGameService.searchGames(
        search.trim(), 
        page, 
        limit,
        {
          strategy: 'combined',
          useCache: true,
          source: 'auto'
        }
      );
      
      const response = {
        games: searchResult.games,
        totalCount: searchResult.total,
        currentPage: searchResult.page,
        totalPages: Math.ceil(searchResult.total / limit),
        hasNextPage: searchResult.hasNextPage,
        hasPreviousPage: searchResult.hasPreviousPage,
        sources: searchResult.sources
      };

      console.log('Search API response:', {
        totalGames: response.totalCount,
        gamesReturned: response.games.length,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        sources: response.sources
      });

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Vary': 'Accept-Encoding, x-search'
        }
      });
    }

    // Handle category-specific requests using UnifiedGameService
    let games = [];
    let totalCount = 0;
    
    if (category === 'popular' || !category) {
      games = await UnifiedGameService.getPopularGames(limit, 'auto');
      totalCount = games.length; // Popular games don't have pagination
    } else if (category === 'trending') {
      games = await UnifiedGameService.getTrendingGames(limit, 'auto');
      totalCount = games.length; // Trending games don't have pagination
    } else if (category === 'upcoming') {
      games = await UnifiedGameService.getUpcomingGames(limit, 'auto');
      totalCount = games.length; // Upcoming games don't have pagination
    } else {
      // For other categories, fall back to popular games
      console.log(`Category "${category}" not implemented, falling back to popular games`);
      games = await UnifiedGameService.getPopularGames(limit, 'auto');
      totalCount = games.length;
    }

    // For simple category requests, we'll simulate pagination
    // Since UnifiedGameService methods don't support complex filtering yet
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = games.slice(startIndex, endIndex);
    
    const response = {
      games: paginatedGames,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: endIndex < totalCount,
      hasPreviousPage: page > 1,
    };

    console.log('Games API response:', {
      totalGames: response.totalCount,
      gamesReturned: response.games.length,
      currentPage: response.currentPage,
      totalPages: response.totalPages
    });

    // Add cache headers (5 minutes for normal requests, 1 hour for search requests)
    const maxAge = 300;
    const headers = {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
      'Vary': 'Accept-Encoding, x-search'
    };

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('Error in games API:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('service unavailable') || error.message.includes('unavailable')) {
        return NextResponse.json(
          { error: 'Game service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      
      // Handle rate limiting errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}