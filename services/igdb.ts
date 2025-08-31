import { Game } from "@/types";
import { IGDBResponse, IGDBGame } from "@/types/igdb-types";
import { IGDB_IMAGE_SIZES } from '@/utils/image-utils';
import { igdbRateLimiter } from './igdb-rate-limiter';
import { fetchWithTimeout, fetchWithRetry } from '@/utils/server-timeout';
import { cacheGameDetails, cachePopularGames, cacheSearchResults } from '@/lib/cache';

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
  timeRange?: 'new_releases' | 'upcoming' | 'classic' | 'recent' | 'this-year' | 'last-year';
  // Enhanced filtering options based on IGDB API
  minRating?: number;
  maxRating?: number;
  gameMode?: number;
  theme?: number;
  ageRating?: number;
  hasMultiplayer?: boolean;
  isIndie?: boolean;
  isAnticipated?: boolean;
}

interface IGDBGameResponse {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  rating?: number;
  total_rating?: number;
  total_rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  hypes?: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  first_release_date?: number;
  summary?: string;
  screenshots?: Array<{
    id: number;
    url: string;
  }>;
  videos?: Array<{
    id: number;
    name: string;
    video_id: string;
  }>;
  artworks?: Array<{
    id: number;
    url: string;
  }>;
}

export class IGDBService {
  // Token caching is now handled by the proxy route

  private static getProxyUrl(): string {
    const isServer = typeof window === 'undefined';
    if (isServer) {
      // For local development, use localhost with correct port
      if (process.env.NODE_ENV === 'development') {
        // Use NEXT_PUBLIC_API_BASE if available, otherwise detect port
        if (process.env.NEXT_PUBLIC_API_BASE) {
          return `${process.env.NEXT_PUBLIC_API_BASE}/api/igdb-proxy`;
        }
        const port = process.env.PORT || '3002';
        return `http://localhost:${port}/api/igdb-proxy`;
      }
      
      // In production, use the public API base URL
      let baseUrl = process.env.NEXT_PUBLIC_API_BASE;
      
      // Fallback to VERCEL_URL if available (format: https://...)
      if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = process.env.VERCEL_URL.startsWith('http') 
          ? process.env.VERCEL_URL 
          : `https://${process.env.VERCEL_URL}`;
      }
      
      // Final fallback for local development
      if (!baseUrl) {
        baseUrl = 'http://localhost:3002';
      }
      
      return `${baseUrl}/api/igdb-proxy`;
    }
    return '/api/igdb-proxy';
  }

  // Token management is now handled entirely by the proxy route
  // This ensures consistent authentication and avoids CORS issues

  // Headers are now managed by the proxy route for consistent authentication

  private static async makeIGDBRequest(endpoint: string, query: string): Promise<any> {
    try {
      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          query
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IGDB request failed: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error making IGDB request to ${endpoint}:`, error);
      throw error;
    }
  }

  private static processGame(game: IGDBGameResponse): Game {
    return {
      id: `igdb_${game.id}`,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id.toString(),
        url: game.cover.url.startsWith('//') 
          ? `https:${game.cover.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.COVER.LARGE)}`
          : game.cover.url.startsWith('https:') 
            ? game.cover.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.COVER.LARGE)
            : `https://${game.cover.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.COVER.LARGE)}`
      } : undefined,
      screenshots: game.screenshots?.map(screenshot => ({
        id: screenshot.id.toString(),
        url: screenshot.url.startsWith('//') 
          ? `https:${screenshot.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA)}`
          : screenshot.url.startsWith('https:') 
            ? screenshot.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA)
            : `https://${screenshot.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.SCREENSHOT.ULTRA)}`
      })),
      videos: game.videos?.map(video => ({
        id: video.id.toString(),
        name: video.name || 'Game Trailer',
        url: `https://www.youtube.com/watch?v=${video.video_id}`,
        thumbnail_url: `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
        video_id: video.video_id,
        provider: 'youtube'
      })),
      artworks: game.artworks?.map(artwork => ({
        id: artwork.id.toString(),
        url: artwork.url.startsWith('//') 
          ? `https:${artwork.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.ARTWORK.ULTRA)}`
          : artwork.url.startsWith('https:') 
            ? artwork.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.ARTWORK.ULTRA)
            : `https://${artwork.url.replace(/t_[a-zA-Z_]+/, IGDB_IMAGE_SIZES.ARTWORK.ULTRA)}`
      })),
      rating: game.total_rating ? Math.round(game.total_rating) : (game.rating ? Math.round(game.rating) : 0),
      total_rating: game.total_rating,
      total_rating_count: game.total_rating_count || 0,
      hype_count: game.hypes || 0,
      genres: game.genres?.map((g) => ({ id: g.id.toString(), name: g.name })) || [],
      platforms: game.platforms?.map((p) => ({ id: p.id.toString(), name: p.name })) || [],
      summary: game.summary,
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
      first_release_date: game.first_release_date
    };
  }

  static async getGames(
    page: number = 1,
    limit: number = 24,
    filters?: GameFilters
  ): Promise<IGDBResponse> {
    try {
      const offset = (page - 1) * limit;

      // Simple, proven conditions that work with IGDB for large datasets
      const conditions: string[] = [
        'category = 0'                      // Main games only - this is the key working condition
      ];
      
      // Check if we have specific filters
      const hasSpecificFilters = filters?.search || filters?.platformId || filters?.genreId || filters?.releaseYear;
      
      // For all filtering, use minimal restrictive conditions to avoid empty results
      conditions.push('cover != null');              // Always require cover
      
      // Only add restrictive conditions when NOT filtering (for popular games browsing)
      if (!hasSpecificFilters) {
        conditions.push('total_rating_count > 3');    // Games with some community engagement for trending
      }
      
      // Add platform filter - use proper IGDB syntax for array membership
      if (filters?.platformId) {
        const platformCondition = `platforms = (${filters.platformId})`;
        conditions.push(platformCondition);
      }

      // Add genre filter - use proper IGDB syntax for array membership
      if (filters?.genreId) {
        const genreCondition = `genres = (${filters.genreId})`;
        conditions.push(genreCondition);
      }

      // Add rating filters
      if (filters?.minRating) {
        conditions.push(`total_rating >= ${filters.minRating}`);
      }
      if (filters?.maxRating) {
        conditions.push(`total_rating <= ${filters.maxRating}`);
      }

      // Add game mode filter
      if (filters?.gameMode) {
        conditions.push(`game_modes = (${filters.gameMode})`);
      }

      // Add theme filter
      if (filters?.theme) {
        conditions.push(`themes = (${filters.theme})`);
      }

      // Add age rating filter
      if (filters?.ageRating) {
        conditions.push(`age_ratings.rating = ${filters.ageRating}`);
      }

      // Add multiplayer filter
      if (filters?.hasMultiplayer) {
        conditions.push(`multiplayer_modes != null`);
      }

      // Enhanced search handling - use filter approach for better results
      // We'll handle this in the query construction below

      // Add release year filter
      if (filters?.releaseYear) {
        conditions.push(`first_release_date >= ${filters.releaseYear.start} & first_release_date <= ${filters.releaseYear.end}`);
      }

      // Add time range filter
      if (filters?.timeRange) {
        const now = Math.floor(Date.now() / 1000);
        const sixMonthsAgo = now - (180 * 24 * 60 * 60);
        const thisYearStart = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
        const lastYearStart = Math.floor(new Date(new Date().getFullYear() - 1, 0, 1).getTime() / 1000);
        const lastYearEnd = Math.floor(new Date(new Date().getFullYear() - 1, 11, 31, 23, 59, 59).getTime() / 1000);
        const threeMonthsAhead = now + (90 * 24 * 60 * 60);
        const fiveYearsAgo = now - (5 * 365 * 24 * 60 * 60);

        switch (filters.timeRange) {
          case 'recent':
          case 'new_releases':
            // Recent: games released in the last 6 months, but not future releases
            conditions.push(`first_release_date >= ${sixMonthsAgo} & first_release_date <= ${now}`);
            break;
          case 'upcoming':
            conditions.push(`first_release_date > ${now} & first_release_date <= ${threeMonthsAhead}`);
            break;
          case 'this-year':
            // This year: all games released in current year (2025), up to today
            const thisYearEnd = Math.floor(new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).getTime() / 1000);
            conditions.push(`first_release_date >= ${thisYearStart} & first_release_date <= ${Math.min(now, thisYearEnd)}`);
            break;
          case 'last-year':
            conditions.push(`first_release_date >= ${lastYearStart} & first_release_date <= ${lastYearEnd}`);
            break;
          case 'classic':
            conditions.push(`first_release_date < ${fiveYearsAgo}`);
            break;
        }
      }

      // Enhanced sort condition for better game discovery - prioritize trending/quality games
      let sortBy = '';
      switch (filters?.sortBy) {
        case 'rating':
          sortBy = 'total_rating desc';
          break;
        case 'popularity':
          // Show most engaging games first - this creates the trending effect
          sortBy = 'total_rating_count desc';
          break;
        case 'name':
          sortBy = 'name asc';
          break;
        case 'release':
          sortBy = 'first_release_date desc';
          break;
        default:
          // When rating filters are applied, sort by rating to show best-rated games in that range first
          if (filters?.minRating || filters?.maxRating) {
            sortBy = 'total_rating desc';
          } else {
            // Default: Show most engaging games first (high community engagement = trending)
            // This naturally surfaces popular/trending games
            sortBy = 'total_rating_count desc';
          }
      }

      // For general browsing without specific filters, use a conservative estimate
      // to avoid expensive count queries on the entire IGDB database
      let totalGames = 25000; // Conservative estimate for high-quality games in IGDB
      
      if (hasSpecificFilters) {
        // Only do expensive count query when we have specific filters
        try {
          // Count query uses the same conditions as the main query
          const countQuery = `where ${conditions.join(' & ')};`;

          // Use timeout for count query - mobile networks need this
          const countResponse = await fetchWithTimeout(this.getProxyUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'games/count',
              query: countQuery.trim()
            })
          }, 15000); // 15 second timeout for count queries

          if (countResponse.ok) {
            const { count } = await countResponse.json();
            totalGames = count;
          }
        } catch (countError) {
          console.warn('Count query failed, using estimate:', countError);
          // Keep the conservative estimate
        }
      }

      // Fetch games with only essential fields for better performance
      let query: string;
      
      if (filters?.search && filters.search.trim()) {
        // Use IGDB games endpoint with name filtering
        const searchTerm = filters.search.trim();
        
        // Use case-insensitive partial matching with wildcards
        conditions.push(`name ~ *"${searchTerm.toLowerCase()}"*`);
        
        query = `
          fields name, 
                 cover.url, 
                 cover.image_id,
                 rating, 
                 total_rating_count, 
                 genres.name, 
                 platforms.name, 
                 first_release_date, 
                 summary;
          where ${conditions.join(' & ')};
          sort ${sortBy};
          limit ${limit};
          offset ${offset};
        `;
      } else {
        // Standard query without search - minimal data
        query = `
          fields name, 
                 cover.url, 
                 cover.image_id,
                 rating, 
                 total_rating_count, 
                 genres.name, 
                 platforms.name, 
                 first_release_date, 
                 summary;
          where ${conditions.join(' & ')};
          sort ${sortBy};
          limit ${limit};
          offset ${offset};
        `;
      }

      // Main games query with retry logic for reliability on mobile networks
      const gamesResponse = await fetchWithRetry(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      }, 3, 20000); // 3 retries, 20 second timeout - best practice for mobile

      if (!gamesResponse.ok) {
        throw new Error('Failed to fetch games');
      }

      const games = await gamesResponse.json();
      const processedGames = games.map(this.processGame);

      // Calculate pagination info
      const totalPages = Math.ceil(totalGames / limit);
      const hasNextPage = page < totalPages && (processedGames.length > 0 || page <= 5);


      return {
        games: processedGames,
        totalCount: totalGames,
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error("Error in IGDB service:", error);
      throw error;
    }
  }

  static async getPopularGames(limit: number = 10, page: number = 1): Promise<Game[]> {
    const getCachedPopularGames = cachePopularGames(page, `${limit}`, () => this.fetchPopularGamesData(limit, page))
    return getCachedPopularGames()
  }

  private static async fetchPopularGamesData(limit: number, page: number): Promise<Game[]> {
    try {
      const offset = (page - 1) * limit;
      const query = `
        fields name, cover.*, first_release_date, rating, total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, hypes, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where category = 0 & cover != null & total_rating_count >= 10;
        sort total_rating_count desc;
        offset ${offset};
        limit ${limit};
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch popular games: ${errorText}`);
      }
      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }
  }

  static async getTrendingGames(limit: number = 10): Promise<Game[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const threeMonthsAgo = now - (90 * 24 * 60 * 60); // 3 months for trending

      const query = `
        fields name, cover.*, first_release_date, rating, total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, hypes, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where category = 0 & cover != null & first_release_date >= ${threeMonthsAgo} & first_release_date <= ${now} & total_rating_count >= 5;
        sort total_rating_count desc;
        limit ${limit};
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch trending games: ${errorText}`);
      }
      
      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error('Error fetching trending games:', error);
      throw error;
    }
  }

  static async getUpcomingGames(limit: number = 10): Promise<Game[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const oneWeekFromNow = now + (7 * 24 * 60 * 60); // 1 week from now to exclude very recent releases
      const eighteenMonthsAhead = now + (18 * 30 * 24 * 60 * 60); // 18 months ahead for reasonable upcoming window

      const query = `
        fields name, cover.*, first_release_date, rating, total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, hypes, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where category = 0 & cover != null & first_release_date >= ${oneWeekFromNow} & first_release_date <= ${eighteenMonthsAhead} & hypes >= 5;
        sort hypes desc;
        limit ${limit};
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch upcoming games: ${errorText}`);
      }

      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
      throw error;
    }
  }

  static async getRecentGames(limit: number = 10): Promise<Game[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60); // 6 months ago for recent window
      // No upper bound - include games up to today to get the latest releases

      const query = `
        fields name, cover.*, first_release_date, rating, total_rating, total_rating_count, aggregated_rating, aggregated_rating_count, hypes, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where category = 0 & cover != null & first_release_date >= ${sixMonthsAgo} & first_release_date <= ${now} & total_rating_count >= 3;
        sort first_release_date desc;
        limit ${limit};
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recent games: ${errorText}`);
      }

      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error("Error fetching recent games:", error);
      throw error;
    }
  }

  static async fetchGameDetails(gameId: string) {
    const getCachedGameDetails = cacheGameDetails(gameId, () =>
      igdbRateLimiter.enqueue(gameId, async () => {
      try {
        
        const query = `
          fields name, cover.*, first_release_date, rating, total_rating, total_rating_count, 
          genres.*, platforms.*, summary, storyline, involved_companies.company.name, 
          involved_companies.developer, involved_companies.publisher, 
          screenshots.url, screenshots.image_id, videos.name, videos.video_id, artworks.url, artworks.image_id;
          where id = ${gameId};
        `;

        const response = await fetch(this.getProxyUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: 'games',
            query: query.trim()
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('IGDB error:', errorText);
          
          // Parse error message to check for rate limiting
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.includes('Too Many Requests')) {
              throw new Error('Too Many Requests');
            }
          } catch {
            // If can't parse, check text content
            if (errorText.includes('Too Many Requests') || errorText.includes('429')) {
              throw new Error('Too Many Requests');
            }
          }
          
          throw new Error('Failed to fetch game details');
        }

        const games = await response.json();
        const [game] = games;
        if (!game) {
          console.log('No game found in IGDB response');
          return null;
        }


        // Process cover image URL
        const coverUrl = game.cover?.url ? (
          game.cover.url.startsWith('//') 
            ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
            : game.cover.url.startsWith('https:') 
              ? game.cover.url.replace('t_thumb', 't_cover_big')
              : `https://${game.cover.url.replace('t_thumb', 't_cover_big')}`
        ) : null;

        // Get background image from artworks or screenshots
        const backgroundImage = game.artworks?.[0]?.url 
          ? `https:${game.artworks[0].url.replace('t_thumb', 't_1080p')}`
          : game.screenshots?.[0]?.url 
            ? `https:${game.screenshots[0].url.replace('t_thumb', 't_1080p')}`
            : coverUrl;


        const processedGame = {
          id: `igdb_${game.id}`,
          name: game.name,
          cover_url: coverUrl,
          background_image: backgroundImage,
          rating: game.rating || game.total_rating || null,
          first_release_date: game.first_release_date || null,
          platforms: game.platforms?.map((p: { name: string }) => p.name) || [],
          genres: game.genres?.map((g: { name: string }) => g.name) || [],
          summary: game.summary || null,
          storyline: game.storyline || null,
          involved_companies: game.involved_companies || [],
          screenshots: game.screenshots?.map((screenshot: any) => ({
            id: screenshot.id || screenshot.image_id,
            url: screenshot.url?.startsWith('//') 
              ? `https:${screenshot.url.replace(/t_[a-zA-Z_]+/, 't_screenshot_huge')}`
              : screenshot.url?.startsWith('https:') 
                ? screenshot.url.replace(/t_[a-zA-Z_]+/, 't_screenshot_huge')
                : `https://${screenshot.url?.replace(/t_[a-zA-Z_]+/, 't_screenshot_huge') || ''}`
          })) || [],
          videos: game.videos?.map((video: any) => ({
            id: video.id,
            name: video.name || 'Game Video',
            video_id: video.video_id,
            url: `https://www.youtube.com/watch?v=${video.video_id}`,
            thumbnail_url: `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`,
            provider: 'youtube'
          })) || [],
          artworks: game.artworks?.map((artwork: any) => ({
            id: artwork.id || artwork.image_id,
            url: artwork.url?.startsWith('//') 
              ? `https:${artwork.url.replace(/t_[a-zA-Z_]+/, 't_1080p')}`
              : artwork.url?.startsWith('https:') 
                ? artwork.url.replace(/t_[a-zA-Z_]+/, 't_1080p')
                : `https://${artwork.url?.replace(/t_[a-zA-Z_]+/, 't_1080p') || ''}`
          })) || []
        };


        return processedGame;
      } catch (error) {
        console.error('Error in fetchGameDetails:', error);
        throw error;
      }
    })
    )
    
    return getCachedGameDetails()
  }

  static async fetchGameAchievements(gameId: string) {
    try {
      const query = `
        fields name, description, category, points, rank, game;
        where game = ${gameId};
        sort rank asc;
        limit 50;
      `;
      
      const achievements = await this.makeIGDBRequest('achievements', query);
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return []; // Return empty array instead of throwing
    }
  }

  static async fetchRelatedGames(gameId: string) {
    try {
      console.log(`Fetching related games for game ID: ${gameId}`);
      
      // First, get the game's company and series info
      const gameInfoQuery = `
        fields name, involved_companies.company.*, collection.*, dlcs.*, expanded_games.*, expansions.*, standalone_expansions.*;
        where id = ${gameId};
      `;
      
      const gameInfoData = await this.makeIGDBRequest('games', gameInfoQuery);
      console.log('Game info response:', gameInfoData);
      
      const [gameInfo] = gameInfoData as IGDBGame[];
      if (!gameInfo) {
        console.error('No game info found for ID:', gameId);
        throw new Error('Game not found');
      }

      // Get company IDs
      const companyIds = gameInfo.involved_companies?.map((ic: { company: { id: number } }) => ic.company.id).filter(Boolean) || [];
      console.log('Found company IDs:', companyIds);
      
      // Get all related game IDs
      const relatedGameIds = new Set<number>();

      // Add games from the same collection/series
      if (gameInfo.collection?.games) {
        gameInfo.collection.games.forEach((id: number) => relatedGameIds.add(id));
      }

      // Add DLCs and expansions
      [
        gameInfo.dlcs || [],
        gameInfo.expanded_games || [],
        gameInfo.expansions || [],
        gameInfo.standalone_expansions || []
      ].flat().forEach(id => relatedGameIds.add(id));

      console.log('Found related game IDs:', Array.from(relatedGameIds));

      // Remove the current game from the set
      relatedGameIds.delete(Number(gameId));

      // If we have no related games yet, get games from the same company
      if (relatedGameIds.size === 0 && companyIds.length > 0) {
        console.log('No direct relations found, fetching games from same companies');
        const companyGamesQuery = `
          fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
          where involved_companies.company = (${companyIds.join(',')}) 
          & id != ${gameId} 
          & cover != null 
          & category = (0,8,9,10,11);
          sort total_rating_count desc;
          limit 12;
        `;
        
        const companyGames = await this.makeIGDBRequest('games', companyGamesQuery);
        console.log('Found company games:', companyGames.length);
        return companyGames;
      }

      // If we have related games (DLCs, series games), fetch their details
      if (relatedGameIds.size > 0) {
        console.log('Fetching details for related games');
        const relatedGamesQuery = `
          fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
          where id = (${Array.from(relatedGameIds).join(',')}) 
          & cover != null 
          & category = (0,8,9,10,11);
          sort total_rating_count desc;
          limit 12;
        `;
        
        const relatedGames = await this.makeIGDBRequest('games', relatedGamesQuery);
        console.log('Found related games:', relatedGames.length);
        return relatedGames;
      }

      console.log('No related games found');
      return [];
    } catch (error) {
      console.error('Error in fetchRelatedGames:', error);
      return [];
    }
  }

  static async getPlatforms() {
    try {
      // Fetch specific popular gaming platforms by their known IDs
      const query = `
        fields name, slug;
        where id = (6,130,167,169,48,49,37,38,39,46,41,7,8,9,11,12,21,23,24,131,34,137,14,18,19,20,5,4,3);
        sort name asc;
        limit 40;
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'platforms',
          query: query.trim()
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch platforms:', await response.text());
        throw new Error('Failed to fetch platforms');
      }

      const platforms = await response.json();
      return platforms.map((platform: any) => ({
        id: platform.id.toString(),
        name: platform.name,
        slug: platform.slug
      }));
    } catch (error) {
      console.error('Error fetching platforms:', error);
      throw error;
    }
  }

  static async getGenres() {
    try {
      // Fetch all available genres to find the correct IDs
      const query = `
        fields name, slug;
        sort name asc;
        limit 50;
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'genres',
          query: query.trim()
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch genres:', await response.text());
        throw new Error('Failed to fetch genres');
      }

      const genres = await response.json();
      return genres.map((genre: any) => ({
        id: genre.id.toString(),
        name: genre.name,
        slug: genre.slug
      }));
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  static async getGameModes() {
    try {
      const query = `
        fields name, slug;
        sort name asc;
        limit 20;
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'game_modes',
          query: query.trim()
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch game modes:', await response.text());
        throw new Error('Failed to fetch game modes');
      }

      const gameModes = await response.json();
      return gameModes.map((mode: any) => ({
        id: mode.id.toString(),
        name: mode.name,
        slug: mode.slug
      }));
    } catch (error) {
      console.error('Error fetching game modes:', error);
      throw error;
    }
  }

  static async getThemes() {
    try {
      const query = `
        fields name, slug;
        sort name asc;
        limit 30;
      `;

      const response = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'themes',
          query: query.trim()
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch themes:', await response.text());
        throw new Error('Failed to fetch themes');
      }

      const themes = await response.json();
      return themes.map((theme: any) => ({
        id: theme.id.toString(),
        name: theme.name,
        slug: theme.slug
      }));
    } catch (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      // Test connection by making a simple query through the proxy
      const testQuery = `fields name; limit 1;`;
      await this.makeIGDBRequest('games', testQuery);
      return true;
    } catch (error) {
      console.error('IGDB connection test failed:', error);
      return false;
    }
  }
}