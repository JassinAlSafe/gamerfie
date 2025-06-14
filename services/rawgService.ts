import { Game } from "@/types";
import { RAWGGame, RAWGResponse } from "@/types/rawg";

const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || "";
const RAWG_BASE_URL = "https://api.rawg.io/api";

export class RAWGService {
  private static async fetchFromRAWG<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<T> {
    const queryParams = new URLSearchParams({
      key: RAWG_API_KEY,
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ),
    });

    const response = await fetch(`${RAWG_BASE_URL}${endpoint}?${queryParams}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RAWG API Error: ${response.statusText}`);
    }

    return response.json();
  }

  private static mapRAWGGameToGame(rawgGame: RAWGGame): Game {
    if (!rawgGame) {
      throw new Error('Invalid RAWG game data: game is null or undefined');
    }

    // RAWG doesn't have proper game covers, only background images (screenshots)
    // Use background image as fallback cover for listing, but mark it appropriately
    const getCoverImage = () => {
      if (rawgGame.background_image) {
        // Return the background image but components should know this isn't ideal
        return rawgGame.background_image;
      }
      return null;
    };

    return {
      id: `rawg_${rawgGame.id}`, // Prefix with source to avoid ID conflicts
      source_id: String(rawgGame.id), // Keep original ID for API calls
      name: rawgGame.name || 'Unknown Game',
      cover_url: getCoverImage(),
      background_image: rawgGame.background_image || null,
      platforms: (rawgGame.platforms || []).map((p) => ({
        id: String(p?.platform?.id || 0),
        name: p?.platform?.name || 'Unknown Platform',
      })),
      genres: (rawgGame.genres || []).map((g) => ({
        id: String(g?.id || 0),
        name: g?.name || 'Unknown Genre',
      })),
      summary: rawgGame.description_raw || null,
      releaseDate: rawgGame.released || null,
      first_release_date: rawgGame.released ? Math.floor(new Date(rawgGame.released).getTime() / 1000) : null,
      total_rating: rawgGame.rating || null,
      rating: rawgGame.rating || null,
      total_rating_count: rawgGame.ratings_count || 0,
      metacritic: rawgGame.metacritic || null,
      status: rawgGame.tba ? "want_to_play" : undefined,
      dataSource: 'rawg' as const,
    } as Game;
  }

  static async searchGames(query: string, page: number = 1, pageSize: number = 20) {
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      search: query,
      page,
      page_size: pageSize,
      search_precise: true,
      exclude_additions: true,
    });

    return {
      games: response.results.map(this.mapRAWGGameToGame),
      total: response.count,
      page,
      pageSize,
      hasNextPage: !!response.next,
      hasPreviousPage: !!response.previous
    };
  }

  static async getGameDetails(gameId: string) {
    const response = await this.fetchFromRAWG<RAWGGame>(`/games/${gameId}`);
    return this.mapRAWGGameToGame(response);
  }

  static async getPopularGames(page: number = 1, pageSize: number = 20) {
    // Get current popular games with high ratings and good coverage
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      ordering: "-rating,-rating_count",  // Order by rating then by number of ratings
      page,
      page_size: pageSize,
      metacritic: "75,100",               // High metacritic scores
      rating: "4.0,5.0",                  // High user ratings (4.0-5.0)
      exclude_additions: true,            // Exclude DLCs
      exclude_parents: true,              // Exclude parent games  
      dates: "2020-01-01,2024-12-31",     // Recent games (last 4-5 years)
      platforms: "18,1,7,186,187,4,5,6",  // Major platforms (PS4,PC,PS5,Xbox Series,Xbox One,Nintendo Switch)
    });

    return {
      games: response.results.map(this.mapRAWGGameToGame),
      total: response.count,
      page,
      pageSize,
      hasNextPage: !!response.next,
      hasPreviousPage: !!response.previous
    };
  }

  static async getUpcomingGames(page: number = 1, pageSize: number = 20) {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2); // Look ahead 2 years for better coverage
    
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      dates: `${today},${nextYear.toISOString().split("T")[0]}`,
      ordering: "-rating,-added",         // Order by rating then by when added
      page,
      page_size: pageSize,
      exclude_additions: true,            // Exclude DLCs
      exclude_parents: true,              // Exclude parent games
      platforms: "18,1,7,186,187,4,5,6",  // Major platforms only
      tag: "-13,10,31",                   // Include: indie, action, adventure (avoid low-quality tags)
    });

    return {
      games: response.results.map(this.mapRAWGGameToGame),
      total: response.count,
      page,
      pageSize,
      hasNextPage: !!response.next,
      hasPreviousPage: !!response.previous
    };
  }

  static async getTrendingGames(page: number = 1, pageSize: number = 20) {
    try {
      // Get games trending in the last 6 months for better results
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
        dates: `${sixMonthsAgo.toISOString().split("T")[0]},${new Date().toISOString().split("T")[0]}`,
        ordering: "-rating,-rating_count",     // Order by rating first, then rating count
        page,
        page_size: pageSize,
        exclude_additions: true,              // Exclude DLCs
        exclude_parents: true,                // Exclude parent games
        metacritic: "70,100",                 // Good metacritic scores
        rating: "3.5,5.0",                    // Good user ratings
        platforms: "18,1,7,186,187,4,5,6",    // Major platforms only
      });

      if (!response || !response.results) {
        throw new Error('Invalid response from RAWG API');
      }

      return {
        games: response.results.filter(Boolean).map(this.mapRAWGGameToGame),
        total: response.count || 0,
        page,
        pageSize,
        hasNextPage: !!response.next,
        hasPreviousPage: !!response.previous
      };
    } catch (error) {
      console.error('Error fetching trending games from RAWG:', error);
      throw error;
    }
  }

  static async getRecentGames(page: number = 1, pageSize: number = 20) {
    try {
      // Get games released in the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
        dates: `${sixMonthsAgo.toISOString().split("T")[0]},${new Date().toISOString().split("T")[0]}`,
        ordering: "-released,-rating",        // Order by release date first, then rating
        page,
        page_size: pageSize,
        exclude_additions: true,              // Exclude DLCs
        exclude_parents: true,                // Exclude parent games
        rating: "3.0,5.0",                    // Decent user ratings
        platforms: "18,1,7,186,187,4,5,6",    // Major platforms only
      });

      if (!response || !response.results) {
        throw new Error('Invalid response from RAWG API');
      }

      return {
        games: response.results.filter(Boolean).map(this.mapRAWGGameToGame),
        total: response.count || 0,
        page,
        pageSize,
        hasNextPage: !!response.next,
        hasPreviousPage: !!response.previous
      };
    } catch (error) {
      console.error('Error fetching recent games from RAWG:', error);
      throw error;
    }
  }

  static async getGameScreenshots(gameId: string) {
    const response = await this.fetchFromRAWG<RAWGResponse<{ id: number; image: string }>>(`/games/${gameId}/screenshots`);
    return response.results;
  }

  static async getGameDevelopers(gameId: string) {
    const response = await this.fetchFromRAWG<RAWGGame>(`/games/${gameId}`);
    return response.developers || [];
  }

  static async getGamePublishers(gameId: string) {
    const response = await this.fetchFromRAWG<RAWGGame>(`/games/${gameId}`);
    return response.publishers || [];
  }

  static async getGameStores(gameId: string) {
    const response = await this.fetchFromRAWG<RAWGResponse<{
      id: number;
      url: string;
      store: {
        id: number;
        name: string;
        slug: string;
        domain: string;
      };
    }>>(`/games/${gameId}/stores`);
    return response.results;
  }
} 