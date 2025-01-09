import { Game, IGDBResponse } from "@/types/index";
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
  timeRange?: 'recent' | 'upcoming' | 'classic';
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
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        url: game.cover.url.replace(/t_[a-zA-Z_]+/, 't_cover_big_2x')
      } : undefined,
      rating: game.rating ? Math.round(game.rating) : undefined,
      total_rating_count: game.total_rating_count || 0,
      genres: game.genres?.map((g) => ({ id: g.id, name: g.name })) || [],
      platforms: game.platforms?.map((p) => ({ id: p.id, name: p.name })) || [],
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

      // Build the base query conditions
      const conditions: string[] = ['cover != null', 'version_parent = null'];
      
      // Add platform filter
      if (filters?.platformId) {
        conditions.push(`platforms = ${filters.platformId}`);
      }

      // Add genre filter
      if (filters?.genreId) {
        conditions.push(`genres = ${filters.genreId}`);
      }

      // Add release year filter
      if (filters?.releaseYear) {
        conditions.push(`first_release_date >= ${filters.releaseYear.start}`);
        conditions.push(`first_release_date <= ${filters.releaseYear.end}`);
      }

      // Add time range filters
      if (filters?.timeRange) {
        const now = Math.floor(Date.now() / 1000);
        const oneYearInSeconds = 31536000;
        
        switch (filters.timeRange) {
          case 'recent':
            // Games released in the last year
            conditions.push(`first_release_date >= ${now - oneYearInSeconds}`);
            break;
          case 'upcoming':
            // Games releasing in the future
            conditions.push(`first_release_date > ${now}`);
            break;
          case 'classic':
            // Games released more than 10 years ago
            conditions.push(`first_release_date < ${now - (oneYearInSeconds * 10)}`);
            break;
        }
      }

      // Add indie games filter
      if (filters?.isIndie) {
        conditions.push('genres.name = "Indie"');
      }

      // Add anticipated games filter
      if (filters?.isAnticipated) {
        const now = Math.floor(Date.now() / 1000);
        conditions.push(`first_release_date > ${now}`);
        conditions.push('hypes != null');
        conditions.push('hypes > 0');
      }

      // Add search filter
      if (filters?.search) {
        conditions.push(`name ~ *"${filters.search}"*`);
      }

      // Build the sort condition
      let sortBy = '';
      switch (filters?.sortBy) {
        case 'rating':
          sortBy = 'rating desc';
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
        fields name, cover.url, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary;
        where ${conditions.join(' & ')};
        sort ${sortBy};
        limit ${limit};
        offset ${offset};
      `;

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
        totalGames,
        currentPage: page,
        totalPages: Math.ceil(totalGames / limit),
        limit
      };
    } catch (error) {
      console.error("Error in IGDB service:", error);
      throw error;
    }
  }

  static async getPopularGames(limit: number = 10): Promise<Game[]> {
    try {
      const headers = await this.getHeaders();
      const query = `
        fields name, cover.url, rating, total_rating_count, genres.*, platforms.*, first_release_date, summary;
        where cover != null & version_parent = null & total_rating_count > 0;
        sort total_rating_count desc;
        limit ${limit};
      `;

      const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: query,
        next: { revalidate: 60 }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popular games');
      }

      const games = await response.json();
      return games.map(this.processGame);
    } catch (error) {
      console.error("Error fetching popular games:", error);
      throw error;
    }
  }
} 