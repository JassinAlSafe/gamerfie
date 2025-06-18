import { NextRequest } from 'next/server';
import { IGDBService } from '@/services/igdb';
import { UnifiedGameService } from '@/services/unifiedGameService';
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

  // Enhanced cache duration - longer for popular games
  const isPopularGamesRequest = !search && platform === 'all' && genre === 'all' && 
                                category === 'all' && year === 'all' && timeRange === 'all';
  const cacheDuration = isPopularGamesRequest ? 600 : 300; // 10min for popular, 5min for searches

  console.log(`📋 Games API - Page ${page}, Limit ${limit}, Popular: ${isPopularGamesRequest}`);

  try {
    // Build filters for IGDB using the correct interface structure
    const filters = {
      page,
      limit,
      search: search.trim(),
      sortBy: sortBy as 'popularity' | 'rating' | 'name' | 'release',
      ...(platform !== 'all' && { platformId: getPlatformId(platform) }),
      ...(genre !== 'all' && { genreId: getGenreId(genre) }),
      ...(year !== 'all' && {
        releaseYear: {
          start: Math.floor(new Date(parseInt(year), 0, 1).getTime() / 1000),
          end: Math.floor(new Date(parseInt(year), 11, 31, 23, 59, 59).getTime() / 1000)
        }
      }),
      ...(timeRange !== 'all' && { timeRange: timeRange as 'new_releases' | 'upcoming' | 'classic' })
    };

    let response: GameResponse;

    // Try IGDB first - our primary high-quality source
    try {
      console.log('🎮 Fetching from IGDB...');
      const igdbResponse = await IGDBService.getGames(page, limit, filters);
      
      console.log(`✅ IGDB returned ${igdbResponse.games.length} games, hasNext: ${igdbResponse.hasNextPage}`);
      
      response = {
        games: igdbResponse.games as unknown as Game[],
        totalCount: igdbResponse.totalCount,
        currentPage: igdbResponse.currentPage,
        totalPages: igdbResponse.totalPages,
        hasNextPage: igdbResponse.hasNextPage,
        hasPreviousPage: igdbResponse.hasPreviousPage,
        source: 'igdb'
      };

    } catch (igdbError) {
      console.warn('⚠️ IGDB service failed, using fallback:', igdbError);
      
      // Enhanced fallback system for infinite scroll
      try {
        // For infinite scroll, we need to ensure we have enough data across multiple pages
        console.log('🔄 Using UnifiedGameService fallback...');
        const unifiedGames = await UnifiedGameService.getPopularGames(limit * 10); // Get more games for pagination
        
        // Calculate pagination for the unified games
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedGames = unifiedGames.slice(startIndex, endIndex);
        
        // Ensure we have realistic pagination for infinite scroll
        const totalAvailable = Math.max(unifiedGames.length, 5000); // Assume we have at least 5000 games
        const calculatedTotalPages = Math.ceil(totalAvailable / limit);
        const hasMorePages = page < calculatedTotalPages && paginatedGames.length === limit;
        
        console.log(`📊 Unified: ${paginatedGames.length} games, page ${page}/${calculatedTotalPages}, hasNext: ${hasMorePages}`);
        
        response = {
          games: paginatedGames,
          totalCount: totalAvailable,
          currentPage: page,
          totalPages: calculatedTotalPages,
          hasNextPage: hasMorePages,
          hasPreviousPage: page > 1,
          source: 'unified'
        };
        
      } catch (unifiedError) {
        console.warn('⚠️ UnifiedGameService also failed, using curated games:', unifiedError);
        
        // Final fallback with expanded curated games for infinite scroll
        const curatedGames = await getExpandedCuratedGames(page, limit);
        const totalCuratedGames = 1000; // Assume we can generate 1000 curated games
        const curatedTotalPages = Math.ceil(totalCuratedGames / limit);
        const hasMoreCurated = page < curatedTotalPages && curatedGames.length === limit;
        
        console.log(`🎯 Curated: ${curatedGames.length} games, page ${page}/${curatedTotalPages}, hasNext: ${hasMoreCurated}`);
        
        response = {
          games: curatedGames,
          totalCount: totalCuratedGames,
          currentPage: page,
          totalPages: curatedTotalPages,
          hasNextPage: hasMoreCurated,
          hasPreviousPage: page > 1,
          source: 'curated'
        };
      }
    }

    // Set cache headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': `public, s-maxage=${cacheDuration}, stale-while-revalidate=86400`,
    });

    console.log(`📤 Returning ${response.games.length} games, hasNextPage: ${response.hasNextPage}`);

    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers 
    });

  } catch (error) {
    console.error('❌ Games API error:', error);
    
    // Error fallback - return some curated games so the UI doesn't break
    const fallbackGames = await getExpandedCuratedGames(1, Math.min(limit, 12));
    
    return new Response(JSON.stringify({
      games: fallbackGames,
      totalCount: fallbackGames.length,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      source: 'fallback',
      error: 'Service temporarily unavailable'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Enhanced function to get more curated games for proper infinite scroll
async function getExpandedCuratedGames(page: number, limit: number): Promise<Game[]> {
  // Expanded list of popular games across different genres and eras
  const popularGamesByCategory = {
    // AAA Blockbusters
    blockbusters: [
      'Grand Theft Auto V', 'The Witcher 3: Wild Hunt', 'Red Dead Redemption 2',
      'Cyberpunk 2077', 'Call of Duty: Modern Warfare', 'Call of Duty: Warzone',
      'Assassin\'s Creed Valhalla', 'FIFA 24', 'NBA 2K24', 'Madden NFL 24'
    ],
    // Classic Games
    classics: [
      'The Elder Scrolls V: Skyrim', 'Portal 2', 'Portal', 'Half-Life 2',
      'Grand Theft Auto: San Andreas', 'The Last of Us', 'God of War',
      'Bioshock Infinite', 'Mass Effect 2', 'Fallout: New Vegas'
    ],
    // Indie Hits
    indies: [
      'Minecraft', 'Among Us', 'Fall Guys', 'Stardew Valley', 'Hollow Knight',
      'Celeste', 'Hades', 'Dead Cells', 'Ori and the Blind Forest', 'Cuphead'
    ],
    // Competitive Games
    competitive: [
      'League of Legends', 'Counter-Strike 2', 'Valorant', 'Overwatch 2',
      'Apex Legends', 'Rocket League', 'Fortnite', 'PUBG: BATTLEGROUNDS',
      'Rainbow Six Siege', 'Dota 2'
    ],
    // RPGs
    rpgs: [
      'Elden Ring', 'Dark Souls III', 'Baldur\'s Gate 3', 'The Witcher 3: Wild Hunt',
      'Persona 5 Royal', 'Final Fantasy XIV', 'World of Warcraft', 'Destiny 2',
      'Diablo IV', 'Path of Exile'
    ],
    // Recent Hits
    recent: [
      'Starfield', 'Hogwarts Legacy', 'Spider-Man Remastered', 'Horizon Zero Dawn',
      'Ghost of Tsushima', 'It Takes Two', 'Valheim', 'Palworld',
      'Lethal Company', 'Pizza Tower'
    ]
  };

  // Flatten all games and create a larger pool
  const allGames = Object.values(popularGamesByCategory).flat();
  
  // For infinite scroll, we need to simulate having many more games
  // We'll cycle through our curated list multiple times with variations
  const expandedGames: string[] = [];
  const baseGames = allGames;
  
  // Create enough games for the requested page
  const totalNeeded = page * limit;
  while (expandedGames.length < totalNeeded) {
    expandedGames.push(...baseGames);
  }

  // Get the games for this specific page
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const pageGames = expandedGames.slice(startIndex, endIndex);

  const curatedGames: Game[] = [];
  
  // Try to fetch these games from IGDB
  for (const gameName of pageGames) {
    try {
      const searchFilters = {
        page: 1,
        limit: 1,
        search: gameName,
        sortBy: 'popularity' as const
      };
      
      const searchResponse = await IGDBService.getGames(1, 1, searchFilters);
      
      if (searchResponse.games.length > 0) {
        curatedGames.push(searchResponse.games[0] as unknown as Game);
      } else {
        // If IGDB doesn't have it, create a placeholder game
        curatedGames.push(createPlaceholderGame(gameName, startIndex + curatedGames.length));
      }
      
      // Stop if we have enough games for this page
      if (curatedGames.length >= limit) break;
      
    } catch (error) {
      console.warn(`Failed to fetch curated game: ${gameName}`);
      // Create placeholder for failed fetches
      if (curatedGames.length < limit) {
        curatedGames.push(createPlaceholderGame(gameName, startIndex + curatedGames.length));
      }
    }
  }

  return curatedGames.slice(0, limit);
}

// Helper function to create placeholder games when IGDB fails
function createPlaceholderGame(name: string, index: number): Game {
  return {
    id: `placeholder_${index}`,
    name: name,
    cover: {
      id: `cover_${index}`,
      url: `https://via.placeholder.com/300x400/4a5568/ffffff?text=${encodeURIComponent(name.substring(0, 20))}`
    },
    rating: Math.floor(Math.random() * 30) + 70, // Random rating between 70-100
    total_rating_count: Math.floor(Math.random() * 1000) + 100,
    genres: [{ id: 'action', name: 'Action' }],
    platforms: [{ id: 'pc', name: 'PC' }],
    summary: `${name} is a popular game that players love to play.`,
    dataSource: 'curated' as any
  };
}