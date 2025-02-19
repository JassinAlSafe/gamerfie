import { Game } from "@/types/game";
import { IGDBResponse } from "@/types/igdb-types";
import { getIGDBToken } from "@/lib/igdb";

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
}

export class IGDBService {
  private static async getHeaders() {
    try {
      const token = await getIGDBToken();
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
      id: game.id.toString(),
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id.toString(),
        url: game.cover.url.replace(/t_[a-zA-Z_]+/, 't_cover_big_2x')
      } : undefined,
      rating: game.rating ? Math.round(game.rating) : 0,
      total_rating_count: game.total_rating_count || 0,
      genres: game.genres?.map((g) => ({ id: g.id.toString(), name: g.name })) || [],
      platforms: game.platforms?.map((p) => ({ id: p.id.toString(), name: p.name })) || [],
      description: game.summary,
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
      first_release_date: game.first_release_date,
      summary: game.summary
    };
  }

  static async getGames(
    page: number = 1,
    limit: number = 24,
    filters?: GameFilters
  ): Promise<IGDBResponse> {
    try {
      const offset = (page - 1) * limit;
      const headers = await this.getHeaders();

      // Build the base query conditions - only require that games have a cover
      const conditions: string[] = ['cover != null'];
      
      // Add platform filter - use proper IGDB syntax for array membership
      if (filters?.platformId) {
        conditions.push(`platforms = [${filters.platformId}]`);
      }

      // Add genre filter - use proper IGDB syntax for array membership
      if (filters?.genreId) {
        conditions.push(`genres = [${filters.genreId}]`);
      }

      // Add search filter if provided - use exact IGDB search syntax
      if (filters?.search) {
        conditions.push(`name ~ "${filters.search}"*`);
      }

      // Add time range filter
      if (filters?.timeRange) {
        const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
        const sixMonthsAgo = now - (180 * 24 * 60 * 60); // 180 days ago
        const threeMonthsAhead = now + (90 * 24 * 60 * 60); // 90 days ahead
        const fiveYearsAgo = now - (5 * 365 * 24 * 60 * 60); // 5 years ago

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

      // Build the sort condition with proper IGDB syntax
      let sortBy = '';
      switch (filters?.sortBy) {
        case 'rating':
          sortBy = 'total_rating desc';
          break;
        case 'popularity':
          sortBy = 'total_rating_count desc';
          break;
        case 'name':
          sortBy = 'name asc';
          break;
        case 'release':
          sortBy = 'first_release_date desc';
          break;
        default:
          sortBy = 'total_rating_count desc';
      }

      // Get total count first
      const countQuery = `where ${conditions.join(' & ')};`;
      console.log('Count Query:', countQuery);

      const countResponse = await fetch("https://api.igdb.com/v4/games/count", {
        method: "POST",
        headers,
        body: countQuery,
        next: { revalidate: 60 }
      });

      if (!countResponse.ok) {
        throw new Error('Failed to fetch games count');
      }

      const { count: totalGames } = await countResponse.json();

      // Fetch games with all necessary fields
      const query = `
        fields name, cover.url, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary, total_rating;
        where ${conditions.join(' & ')};
        sort ${sortBy};
        limit ${limit};
        offset ${offset};
      `;
      console.log('Games Query:', query);

      const gamesResponse = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: query,
        next: { revalidate: 60 }
      });

      if (!gamesResponse.ok) {
        throw new Error('Failed to fetch games');
      }

      const games = await gamesResponse.json();
      const processedGames = games.map(this.processGame);

      return {
        games: processedGames,
        totalCount: totalGames, // Changed from totalGames
        currentPage: page,
        totalPages: Math.ceil(totalGames / limit),
        hasNextPage: page < Math.ceil(totalGames / limit), // Added
        hasPreviousPage: page > 1, // Added
      };
    } catch (error) {
      console.error("Error in IGDB service:", error);
      throw error;
    }
  }

  static async getPopularGames(limit: number = 10): Promise<Game[]> {
    try {
      const token = await getIGDBToken();
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `
          fields name, cover.*, first_release_date, rating, genres.*, platforms.*, summary;
          where rating != null & rating > 75 & cover != null;
          sort total_rating_count desc;
          limit ${limit};
        `
      });

      if (!response.ok) throw new Error('Failed to fetch popular games');
      const games = await response.json();
      return this.processGameData(games);
    } catch (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }
  }

  static async getTrendingGames(limit: number = 10): Promise<Game[]> {
    try {
      const token = await getIGDBToken();
      const now = Math.floor(Date.now() / 1000);
      const threeMonthsAgo = now - (90 * 24 * 60 * 60);

      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `
          fields name, cover.*, first_release_date, rating, genres.*, platforms.*, summary;
          where first_release_date >= ${threeMonthsAgo} & first_release_date <= ${now} & cover != null;
          sort total_rating_count desc;
          limit ${limit};
        `
      });

      if (!response.ok) throw new Error('Failed to fetch trending games');
      const games = await response.json();
      return this.processGameData(games);
    } catch (error) {
      console.error('Error fetching trending games:', error);
      throw error;
    }
  }

  private static processGameData(games: any[]): Game[] {
    return games.map(game => ({
      id: game.id.toString(),
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id.toString(),
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : null,
      rating: game.rating || 0,
      genres: game.genres?.map((g: any) => ({ id: g.id.toString(), name: g.name })) || [],
      platforms: game.platforms?.map((p: any) => ({ id: p.id.toString(), name: p.name })) || [],
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
      summary: game.summary || null
    }));
  }

  static async getUpcomingGames(limit: number = 10): Promise<Game[]> {
    try {
      const headers = await this.getHeaders();
      const now = Math.floor(Date.now() / 1000);
      const threeMonthsAhead = now + (90 * 24 * 60 * 60);

      const query = `
        fields name, cover.url, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary;
        where cover != null 
        & first_release_date > ${now}
        & first_release_date <= ${threeMonthsAhead}
        & hypes > 0;
        sort first_release_date asc;
        limit ${limit};
      `;

      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: query,
        next: { revalidate: 60 }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming games');
      }

      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
      throw error;
    }
  }
}