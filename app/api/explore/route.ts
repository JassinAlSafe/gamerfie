import { NextRequest, NextResponse } from 'next/server';
import { UnifiedGameService } from '@/services/unifiedGameService';
import { PlaylistService } from '@/services/playlistService';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

interface ExploreResponse {
  popular: any[];
  trending: any[];
  upcoming: any[];
  recent: any[];
  classic: any[];
  featuredPlaylists: any[];
  stats: {
    totalGames: number;
    totalPlaylists: number;
  };
}

// Cache the response for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
let cachedResponse: { data: ExploreResponse; timestamp: number } | null = null;

// Helper function to clear cache (for development)
function clearCache() {
  cachedResponse = null;
}

// Helper function to detect mobile requests
function isMobileRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Execute requests sequentially for mobile, parallel for desktop
async function executeRequests(requests: Promise<any>[], isMobile: boolean) {
  if (isMobile) {
    // Sequential execution for mobile networks
    const results = [];
    for (const request of requests) {
      try {
        const result = await request;
        results.push({ status: 'fulfilled', value: result });
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
      }
    }
    return results;
  } else {
    // Parallel execution for desktop
    return await Promise.allSettled(requests);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Make this static by providing a default limit instead of reading from searchParams
    const limit = 12; // Fixed limit for static generation
    const isMobile = isMobileRequest(request);

    // Clear cache if refresh parameter is provided (for development)
    const { searchParams } = new URL(request.url);
    if (searchParams.get('refresh') === 'true') {
      clearCache();
    }

    // Check cache first
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      console.log('Serving cached explore data');
      return NextResponse.json(cachedResponse.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT'
        }
      });
    }

    console.log(`Fetching fresh explore data (${isMobile ? 'mobile' : 'desktop'} strategy)...`);

    // Mobile-optimized batch fetch - sequential for mobile, parallel for desktop
    const requests = [
      UnifiedGameService.getPopularGames(limit, 'auto'),
      UnifiedGameService.getTrendingGames(limit, 'auto'),
      UnifiedGameService.getUpcomingGames(limit, 'auto'),
      UnifiedGameService.getRecentGames(limit, 'auto'),
      UnifiedGameService.getPopularGames(limit, 'auto'), // Use popular as fallback for classic
      PlaylistService.getFeaturedPlaylists(5)
    ];

    const [
      popularGames,
      trendingGames,
      upcomingGames,
      recentGames,
      classicGames,
      featuredPlaylists
    ] = await executeRequests(requests, isMobile);

    // Process featured playlists - ONLY add fallback games if the playlist truly has NO gameIds
    let processedPlaylists = featuredPlaylists.status === 'fulfilled' ? featuredPlaylists.value : [];
    
    // Log playlist details for debugging
    processedPlaylists.forEach((playlist: any) => {
      console.log(`Playlist "${playlist.title}": gameIds=${playlist.gameIds?.length || 0}, games=${playlist.games?.length || 0}`);
      if (playlist.gameIds?.length > 0) {
        console.log(`  Game IDs: ${playlist.gameIds.slice(0, 3).join(', ')}${playlist.gameIds.length > 3 ? '...' : ''}`);
      }
    });
    
    // Only add fallback games if playlist has NO gameIds in database
    if (processedPlaylists.length > 0) {
      processedPlaylists = await Promise.all(
        processedPlaylists.map(async (playlist: any) => {
          // Only add fallback if the playlist has NO gameIds stored in database
          if (!playlist.gameIds || playlist.gameIds.length === 0) {
            try {
              const fallbackGames = popularGames.status === 'fulfilled' 
                ? popularGames.value.slice(0, 5)
                : [];
              return {
                ...playlist,
                games: fallbackGames,
                gameIds: fallbackGames.map((g: any) => g.id)
              };
            } catch (error) {
              console.warn('Failed to add fallback games to playlist:', error);
              return playlist;
            }
          }
          return playlist;
        })
      );
    }

    const response: ExploreResponse = {
      popular: popularGames.status === 'fulfilled' ? popularGames.value : [],
      trending: trendingGames.status === 'fulfilled' ? trendingGames.value : [],
      upcoming: upcomingGames.status === 'fulfilled' ? upcomingGames.value : [],
      recent: recentGames.status === 'fulfilled' ? recentGames.value : [],
      classic: classicGames.status === 'fulfilled' ? classicGames.value : [],
      featuredPlaylists: processedPlaylists,
      stats: {
        totalGames: 1000,
        totalPlaylists: processedPlaylists.length
      }
    };

    // Log any failures
    [popularGames, trendingGames, upcomingGames, recentGames, classicGames, featuredPlaylists].forEach((result, index) => {
      if (result.status === 'rejected') {
        const categories = ['popular', 'trending', 'upcoming', 'recent', 'classic', 'playlists'];
        console.warn(`Failed to fetch ${categories[index]} data:`, result.reason);
      }
    });

    // Cache the response
    cachedResponse = {
      data: response,
      timestamp: Date.now()
    };

    console.log('Explore API batch response:', {
      popular: response.popular.length,
      trending: response.trending.length,
      upcoming: response.upcoming.length,
      recent: response.recent.length,
      classic: response.classic.length,
      playlists: response.featuredPlaylists.length,
      playlistsWithGames: response.featuredPlaylists.filter(p => p.games && p.games.length > 0).length,
      totalApiCalls: 1 // Single batched call vs 868+ individual calls
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Explore API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch explore data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 