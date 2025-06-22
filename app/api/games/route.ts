import { NextRequest } from 'next/server';
import { IGDBService } from '@/services/igdb';
import { Game } from '@/types';

// Force dynamic rendering due to search params
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type GameCategory = 'all' | 'popular' | 'trending' | 'upcoming' | 'recent' | 'classic';
export type GameSortOption = 'popularity' | 'rating' | 'name' | 'release';

// Platform mapping helper
function getPlatformId(platform: string): number | undefined {
  const platformMap: Record<string, number> = {
    'pc': 6,          // PC (Microsoft Windows)
    'ps4': 48,        // PlayStation 4
    'ps5': 167,       // PlayStation 5
    'xbox-one': 49,   // Xbox One
    'xbox-series': 169, // Xbox Series X|S
    'switch': 130,    // Nintendo Switch
    'ios': 131,       // iOS
    'android': 137,   // Android
  };
  
  return platformMap[platform];
}

// Genre mapping helper
function getGenreId(genre: string): number | undefined {
  const genreMap: Record<string, number> = {
    'action': 31,      // Action
    'adventure': 32,   // Adventure
    'rpg': 12,         // Role-playing (RPG)
    'shooter': 5,      // Shooter
    'strategy': 15,    // Strategy
    'simulation': 13,  // Simulator
    'sports': 14,      // Sport
    'racing': 10,      // Racing
    'fighting': 4,     // Fighting
    'puzzle': 9,       // Puzzle
    'platform': 8,     // Platform
    'indie': 32,       // Indie (using Adventure as fallback)
  };
  
  return genreMap[genre];
}

// Game mode mapping helper
function getGameModeId(mode: string): number | undefined {
  const gameModeMap: Record<string, number> = {
    'single-player': 1,    // Single player
    'multiplayer': 2,      // Multiplayer
    'co-op': 3,           // Co-operative
    'split-screen': 4,     // Split screen
    'mmo': 5,             // Massively Multiplayer Online (MMO)    
    'battle-royale': 6,   // Battle Royale
  };
  
  return gameModeMap[mode];
}

// Theme mapping helper
function getThemeId(theme: string): number | undefined {
  const themeMap: Record<string, number> = {
    'action': 1,          // Action
    'fantasy': 17,        // Fantasy
    'sci-fi': 18,         // Science fiction
    'horror': 19,         // Horror
    'thriller': 20,       // Thriller
    'survival': 21,       // Survival
    'historical': 22,     // Historical
    'stealth': 23,        // Stealth
    'comedy': 27,         // Comedy
    'mystery': 28,        // Mystery
    'romance': 33,        // Romance
    'war': 35,           // Warfare
    'kids': 43,          // Kids
  };
  
  return themeMap[theme];
}

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
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '24')));
  const platform = searchParams.get('platform') || 'all';
  const genre = searchParams.get('genre') || 'all';
  const category = searchParams.get('category') || 'all';
  const year = searchParams.get('year') || 'all';
  const sortBy = searchParams.get('sort') || 'popularity';
  const search = searchParams.get('search') || '';
  const timeRange = searchParams.get('timeRange') || 'all';
  
  // Enhanced filter parameters
  const gameMode = searchParams.get('gameMode') || 'all';
  const theme = searchParams.get('theme') || 'all';
  const minRating = searchParams.get('minRating');
  const maxRating = searchParams.get('maxRating');
  const hasMultiplayer = searchParams.get('multiplayer') === 'true';

  // IGDB cache duration - longer for popular games, shorter for searches
  const isPopularGamesRequest = !search && platform === 'all' && genre === 'all' && 
                                category === 'all' && year === 'all' && timeRange === 'all';
  const cacheDuration = isPopularGamesRequest ? 900 : 300; // 15min for popular, 5min for searches (IGDB only)


  try {
    // Build filters for IGDB using the correct interface structure
    const filters = {
      page,
      limit,
      search: search.trim(),
      sortBy: sortBy as 'popularity' | 'rating' | 'name' | 'release',
      ...(platform !== 'all' && { platformId: getPlatformId(platform) }),
      ...(genre !== 'all' && { genreId: getGenreId(genre) }),
      ...(gameMode !== 'all' && { gameMode: getGameModeId(gameMode) }),
      ...(theme !== 'all' && { theme: getThemeId(theme) }),
      ...(minRating && { minRating: parseFloat(minRating) }),
      ...(maxRating && { maxRating: parseFloat(maxRating) }),
      ...(hasMultiplayer && { hasMultiplayer: true }),
      ...(year !== 'all' && {
        releaseYear: {
          start: Math.floor(new Date(parseInt(year), 0, 1).getTime() / 1000),
          end: Math.floor(new Date(parseInt(year), 11, 31, 23, 59, 59).getTime() / 1000)
        }
      }),
      ...(timeRange !== 'all' && { timeRange: timeRange as 'new_releases' | 'upcoming' | 'classic' })
    };

    // Use IGDB exclusively for all-games page - no fallbacks
    
    const igdbResponse = await IGDBService.getGames(page, limit, filters);
    
    const response: GameResponse = {
      games: igdbResponse.games as unknown as Game[],
      totalCount: igdbResponse.totalCount,
      currentPage: igdbResponse.currentPage,
      totalPages: igdbResponse.totalPages,
      hasNextPage: igdbResponse.hasNextPage,
      hasPreviousPage: igdbResponse.hasPreviousPage,
      source: 'igdb'
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

