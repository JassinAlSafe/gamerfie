import { NextRequest } from 'next/server';
import { UnifiedGameService } from '@/services/unifiedGameService';
import { Game } from '@/types';
import { isMobileUserAgent } from '@/utils/server-timeout';

// Force dynamic rendering due to search params
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type GameCategory = 'all' | 'popular' | 'trending' | 'upcoming' | 'recent' | 'classic';
export type GameSortOption = 'popularity' | 'rating' | 'name' | 'release';

// Platform mapping helper (currently unused)
// function getPlatformId(platform: string): number | undefined {
//   const platformMap: Record<string, number> = {
//     'pc': 6,          // PC (Microsoft Windows)
//     'ps4': 48,        // PlayStation 4
//     'ps5': 167,       // PlayStation 5
//     'xbox-one': 49,   // Xbox One
//     'xbox-series': 169, // Xbox Series X|S
//     'switch': 130,    // Nintendo Switch
//     'ios': 131,       // iOS
//     'android': 137,   // Android
//   };
//   
//   return platformMap[platform];
// }

// Genre mapping helper (currently unused)
// function getGenreId(genre: string): number | undefined {
//   const genreMap: Record<string, number> = {
//     'action': 31,      // Action
//     'adventure': 32,   // Adventure
//     'rpg': 12,         // Role-playing (RPG)
//     'shooter': 5,      // Shooter
//     'strategy': 15,    // Strategy
//     'simulation': 13,  // Simulator
//     'sports': 14,      // Sport
//     'racing': 10,      // Racing
//     'fighting': 4,     // Fighting
//     'puzzle': 9,       // Puzzle
//     'platform': 8,     // Platform
//     'indie': 32,       // Indie (using Adventure as fallback)
//   };
//   
//   return genreMap[genre];
// }

// Game mode mapping helper (currently unused)
// function getGameModeId(mode: string): number | undefined {
//   const gameModeMap: Record<string, number> = {
//     'single-player': 1,    // Single player
//     'multiplayer': 2,      // Multiplayer
//     'co-op': 3,           // Co-operative
//     'split-screen': 4,     // Split screen
//     'mmo': 5,             // Massively Multiplayer Online (MMO)    
//     'battle-royale': 6,   // Battle Royale
//   };
//   
//   return gameModeMap[mode];
// }

// Theme mapping helper (currently unused)
// function getThemeId(theme: string): number | undefined {
//   const themeMap: Record<string, number> = {
//     'action': 1,          // Action
//     'fantasy': 17,        // Fantasy
//     'sci-fi': 18,         // Science fiction
//     'horror': 19,         // Horror
//     'thriller': 20,       // Thriller
//     'survival': 21,       // Survival
//     'historical': 22,     // Historical
//     'stealth': 23,        // Stealth
//     'comedy': 27,         // Comedy
//     'mystery': 28,        // Mystery
//     'romance': 33,        // Romance
//     'war': 35,           // Warfare
//     'kids': 43,          // Kids
//   };
//   
//   return themeMap[theme];
// }

interface GameResponse {
  games: Game[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  source?: string;
  error?: string;
}



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Mobile-aware configuration for caching
  const userAgent = request.headers.get('user-agent');
  const isMobile = isMobileUserAgent(userAgent);
  // Note: Server timeout is handled within the IGDB service layer
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '24')));
  const platform = searchParams.get('platform') || 'all';
  const genre = searchParams.get('genre') || 'all';
  const category = searchParams.get('category') || 'all';
  const year = searchParams.get('year') || 'all';
  // const sortBy = searchParams.get('sort') || 'popularity';
  const search = searchParams.get('search') || '';
  const timeRange = searchParams.get('timeRange') || 'all';
  const source = searchParams.get('source') || 'auto';
  
  // Enhanced filter parameters (currently unused)
  // const gameMode = searchParams.get('gameMode') || 'all';
  // const theme = searchParams.get('theme') || 'all';
  // const minRating = searchParams.get('minRating');
  // const maxRating = searchParams.get('maxRating');
  // const hasMultiplayer = searchParams.get('multiplayer') === 'true';

  // IGDB cache duration - mobile gets longer cache to reduce network usage
  const isPopularGamesRequest = !search && platform === 'all' && genre === 'all' && 
                                category === 'all' && year === 'all' && timeRange === 'all';
  
  // Longer cache for mobile devices to reduce network requests
  let cacheDuration = isPopularGamesRequest ? 900 : 300; // 15min for popular, 5min for searches
  if (isMobile) {
    cacheDuration *= 2; // Double cache time for mobile (30min/10min)
  }


  try {
    // Build filters for IGDB using the correct interface structure (currently unused)
    // const filters = {
    //   page,
    //   limit,
    //   search: search.trim(),
    //   sortBy: sortBy as 'popularity' | 'rating' | 'name' | 'release',
    //   ...(platform !== 'all' && { platformId: getPlatformId(platform) }),
    //   ...(genre !== 'all' && { genreId: getGenreId(genre) }),
    //   ...(gameMode !== 'all' && { gameMode: getGameModeId(gameMode) }),
    //   ...(theme !== 'all' && { theme: getThemeId(theme) }),
    //   ...(minRating && { minRating: parseFloat(minRating) }),
    //   ...(maxRating && { maxRating: parseFloat(maxRating) }),
    //   ...(hasMultiplayer && { hasMultiplayer: true }),
    //   ...(year !== 'all' && {
    //     releaseYear: {
    //       start: Math.floor(new Date(parseInt(year), 0, 1).getTime() / 1000),
    //       end: Math.floor(new Date(parseInt(year), 11, 31, 23, 59, 59).getTime() / 1000)
    //     }
    //   }),
    //   ...(timeRange !== 'all' && { timeRange: timeRange as 'new_releases' | 'upcoming' | 'classic' })
    // };

    // Handle category-based requests using UnifiedGameService for smart source selection
    let games: Game[] = [];
    let totalCount = 0;
    let actualPage = page;
    let totalPages = 0;
    let hasNextPage = false;
    let hasPreviousPage = false;
    let actualSource = 'igdb';
    
    if (search.trim()) {
      // Use UnifiedGameService for search-based requests (has search term)
      const searchResult = await UnifiedGameService.searchGames(
        search.trim(), 
        page, 
        limit,
        { source: source as any }
      );
      
      games = searchResult.games;
      totalCount = searchResult.total;
      actualPage = searchResult.page;
      hasNextPage = searchResult.hasNextPage;
      hasPreviousPage = searchResult.hasPreviousPage;
      totalPages = Math.ceil(totalCount / limit);
      actualSource = source === 'hybrid' ? 'hybrid' : (searchResult.sources[0] || 'igdb');
      
    } else if (category !== 'all') {
      // Use UnifiedGameService for specific category requests
      try {
        switch (category as GameCategory) {
          case 'popular':
            games = await UnifiedGameService.getPopularGames(limit, source as any);
            break;
          case 'trending':
            games = await UnifiedGameService.getTrendingGames(limit, source as any);
            break;
          case 'upcoming':
            games = await UnifiedGameService.getUpcomingGames(limit, source as any);
            break;
          case 'recent':
            games = await UnifiedGameService.getRecentGames(limit, source as any);
            break;
          default:
            // Fallback to search for unknown categories
            const igdbResponse = await UnifiedGameService.searchGames('', page, limit, {
              source: source as any
            });
            games = igdbResponse.games;
            totalCount = igdbResponse.total;
            actualPage = igdbResponse.page;
            hasNextPage = igdbResponse.hasNextPage;
            hasPreviousPage = igdbResponse.hasPreviousPage;
            totalPages = Math.ceil(totalCount / limit);
        }
        
        // For category-based requests, calculate pagination info
        if (['popular', 'trending', 'upcoming', 'recent'].includes(category)) {
          totalCount = games.length * 10; // Estimate based on typical game APIs
          actualPage = 1; // Category requests are typically single page
          totalPages = 1;
          hasNextPage = false;
          hasPreviousPage = false;
        }
        
        actualSource = source === 'hybrid' ? 'hybrid' : (games[0]?.dataSource || 'igdb');
        
      } catch (categoryError) {
        console.warn(`Category-based request failed for ${category}, falling back to search:`, categoryError);
        // Fallback to search-based approach
        const searchResult = await UnifiedGameService.searchGames('', page, limit);
        games = searchResult.games;
        totalCount = searchResult.total;
        actualPage = searchResult.page;
        hasNextPage = searchResult.hasNextPage;
        hasPreviousPage = searchResult.hasPreviousPage;
        totalPages = Math.ceil(totalCount / limit);
        actualSource = 'igdb';
      }
      
    } else {
      // Handle category='all' - use paginated popular games for proper page support
      try {
        // Use the new paginated popular games method for category='all'
        const searchResult = await UnifiedGameService.getPopularGamesPaginated(
          page, 
          limit, 
          source as any
        );
        
        games = searchResult.games;
        totalCount = searchResult.total;
        actualPage = searchResult.page;
        hasNextPage = searchResult.hasNextPage;
        hasPreviousPage = searchResult.hasPreviousPage;
        totalPages = Math.ceil(totalCount / limit);
        actualSource = source === 'hybrid' ? 'hybrid' : (searchResult.sources[0] || 'igdb');
        
      } catch (allCategoryError) {
        console.warn('All category request failed:', allCategoryError);
        // If paginated popular games fails, return empty results
        games = [];
        totalCount = 0;
        actualPage = page;
        totalPages = 0;
        hasNextPage = false;
        hasPreviousPage = false;
        actualSource = 'igdb';
      }
    }
    
    const response: GameResponse = {
      games,
      totalCount,
      currentPage: actualPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      source: actualSource
    };

    // Set cache headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': `public, s-maxage=${cacheDuration}, stale-while-revalidate=86400`,
    });


    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers 
    });

  } catch (error) {
    console.error('IGDB API error:', error);
    
    // Return error response - no fallbacks for all-games page
    return new Response(JSON.stringify({
      games: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      source: 'igdb',
      error: error instanceof Error ? error.message : 'IGDB service temporarily unavailable'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

