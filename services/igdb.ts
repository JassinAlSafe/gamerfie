import { Game } from "@/types";
import { IGDBResponse, IGDBGame } from "@/types/igdb-types";
import { IGDB_IMAGE_SIZES } from '@/utils/image-utils';
import { igdbRateLimiter } from './igdb-rate-limiter';

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
  total_rating_count?: number;
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
  private static cachedToken: string | null = null;
  private static tokenExpiry: number | null = null;

  private static getProxyUrl(): string {
    const isServer = typeof window === 'undefined';
    return isServer 
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/igdb-proxy`
      : '/api/igdb-proxy';
  }

  private static async getIGDBToken(): Promise<string> {
    try {
      // Return cached token if still valid (with 5 minute buffer)
      if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
        return this.cachedToken;
      }

      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID) {
        throw new Error('NEXT_PUBLIC_TWITCH_CLIENT_ID is not configured');
      }
      if (!process.env.TWITCH_CLIENT_SECRET) {
        throw new Error('TWITCH_CLIENT_SECRET is not configured');
      }

      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get IGDB token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token || typeof data.expires_in !== 'number') {
        console.error('Invalid token response:', data);
        throw new Error('Invalid token response from Twitch');
      }

      // Cache the token with a 5-minute buffer before expiry
      this.cachedToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return data.access_token;
    } catch (error) {
      // Clear cached token in case of error
      this.cachedToken = null;
      this.tokenExpiry = null;
      console.error('Error getting IGDB token:', error);
      throw error;
    }
  }

  static async getHeaders() {
    try {
      const token = await this.getIGDBToken();
      if (!token) {
        throw new Error('Failed to get IGDB access token');
      }

      return {
        "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "text/plain"
      };
    } catch (error) {
      console.error('Error getting IGDB headers:', error);
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
      rating: game.rating ? Math.round(game.rating) : 0,
      total_rating_count: game.total_rating_count || 0,
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
      
      
      // For trending/rating-first approach, we need games with rating data
      if (!hasSpecificFilters) {
        // Add minimal quality conditions to get engaging, trending games
        conditions.push('total_rating_count > 3');    // Games with some community engagement
        conditions.push('cover != null');              // Ensure games have cover images
      } else {
        // Add basic quality filters when searching/filtering
        if (!filters?.search) {
          // Only add restrictive filters when NOT searching
          conditions.push('version_parent = null');    // No duplicate editions
          conditions.push('status = 0');               // Released games only
        }
        conditions.push('cover != null');              // Always require cover
      }
      
      // Add platform filter - use proper IGDB syntax for array membership
      if (filters?.platformId) {
        conditions.push(`platforms = (${filters.platformId})`);
      }

      // Add genre filter - use proper IGDB syntax for array membership
      if (filters?.genreId) {
        conditions.push(`genres = (${filters.genreId})`);
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
        const threeMonthsAhead = now + (90 * 24 * 60 * 60);
        const fiveYearsAgo = now - (5 * 365 * 24 * 60 * 60);

        switch (filters.timeRange) {
          case 'new_releases':
            conditions.push(`first_release_date >= ${sixMonthsAgo} & first_release_date <= ${now}`);
            break;
          case 'upcoming':
            conditions.push(`first_release_date > ${now} & first_release_date <= ${threeMonthsAhead}`);
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
          // Default: Show most engaging games first (high community engagement = trending)
          // This naturally surfaces popular/trending games
          sortBy = 'total_rating_count desc';
      }

      // For general browsing without specific filters, use a conservative estimate
      // to avoid expensive count queries on the entire IGDB database
      let totalGames = 25000; // Conservative estimate for high-quality games in IGDB
      
      if (hasSpecificFilters) {
        // Only do expensive count query when we have specific filters
        try {
          // Count query uses the same conditions as the main query
          const countQuery = `where ${conditions.join(' & ')};`;

          const countResponse = await fetch(this.getProxyUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'games/count',
              query: countQuery.trim()
            })
          });

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

      const gamesResponse = await fetch(this.getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'games',
          query: query.trim()
        })
      });

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

  static async getPopularGames(limit: number = 10): Promise<Game[]> {
    try {
      const query = `
        fields name, cover.*, cover.url, cover.image_id, first_release_date, rating, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where rating != null & rating > 75 & cover != null;
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
      const sixMonthsAgo = now - (180 * 24 * 60 * 60); // Increased from 3 to 6 months

      const query = `
        fields name, cover.*, cover.url, cover.image_id, first_release_date, rating, genres.*, platforms.*, summary, screenshots.*, videos.*, artworks.*;
        where first_release_date >= ${sixMonthsAgo} & first_release_date <= ${now} & cover != null & total_rating_count > 10;
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
      const threeMonthsAhead = now + (90 * 24 * 60 * 60);

      const query = `
        fields name, cover.*, cover.url, cover.image_id, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary, screenshots.*, videos.*, artworks.*;
        where cover != null 
        & first_release_date > ${now}
        & first_release_date <= ${threeMonthsAhead}
        & hypes > 0;
        sort first_release_date asc;
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
      const sixMonthsAgo = now - (180 * 24 * 60 * 60); // 6 months ago

      const query = `
        fields name, cover.*, cover.url, cover.image_id, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary, screenshots.*, videos.*, artworks.*;
        where cover != null 
        & first_release_date >= ${sixMonthsAgo}
        & first_release_date <= ${now}
        & total_rating_count > 5;
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
    return igdbRateLimiter.enqueue(gameId, async () => {
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
          } catch (parseError) {
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
    });
  }

  static async fetchGameAchievements(gameId: string) {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch('https://api.igdb.com/v4/achievements', {
        method: 'POST',
        headers,
        body: `
          fields name, description, category, points, rank, game;
          where game = ${gameId};
          sort rank asc;
          limit 50;
        `,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('IGDB achievements error:', errorText);
        throw new Error('Failed to fetch achievements');
      }

      const achievements = await response.json();
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return []; // Return empty array instead of throwing
    }
  }

  static async fetchRelatedGames(gameId: string) {
    try {
      const headers = await this.getHeaders();
      console.log(`Fetching related games for game ID: ${gameId}`);
      
      // First, get the game's company and series info
      const gameInfoResponse = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers,
        body: `
          fields name, involved_companies.company.*, collection.*, dlcs.*, expanded_games.*, expansions.*, standalone_expansions.*;
          where id = ${gameId};
        `,
      });

      if (!gameInfoResponse.ok) {
        const errorText = await gameInfoResponse.text();
        console.error('Failed to fetch game info:', errorText);
        throw new Error(`Failed to fetch game info: ${errorText}`);
      }

      const gameInfoData = await gameInfoResponse.json();
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
        const companyGamesResponse = await fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers,
          body: `
            fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
            where involved_companies.company = (${companyIds.join(',')}) 
            & id != ${gameId} 
            & cover != null 
            & category = (0,8,9,10,11);
            sort total_rating_count desc;
            limit 12;
          `,
        });

        if (!companyGamesResponse.ok) {
          const errorText = await companyGamesResponse.text();
          console.error('Failed to fetch company games:', errorText);
          throw new Error(`Failed to fetch company games: ${errorText}`);
        }

        const companyGames = await companyGamesResponse.json();
        console.log('Found company games:', companyGames.length);
        return companyGames;
      }

      // If we have related games (DLCs, series games), fetch their details
      if (relatedGameIds.size > 0) {
        console.log('Fetching details for related games');
        const relatedGamesResponse = await fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers,
          body: `
            fields name, cover.url, rating, total_rating_count, first_release_date, version_parent;
            where id = (${Array.from(relatedGameIds).join(',')}) 
            & cover != null 
            & category = (0,8,9,10,11);
            sort total_rating_count desc;
            limit 12;
          `,
        });

        if (!relatedGamesResponse.ok) {
          const errorText = await relatedGamesResponse.text();
          console.error('Failed to fetch related games:', errorText);
          throw new Error(`Failed to fetch related games: ${errorText}`);
        }

        const relatedGames = await relatedGamesResponse.json();
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
      const query = `
        fields name, slug;
        where category = (1,2,3,4,5,6);
        sort name asc;
        limit 50;
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
      const token = await this.getIGDBToken();
      return !!token;
    } catch (error) {
      console.error('IGDB connection test failed:', error);
      return false;
    }
  }
}