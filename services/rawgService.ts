import { Game } from "@/types/game";
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
    return {
      id: String(rawgGame.id),
      title: rawgGame.name,
      coverImage: rawgGame.background_image,
      lastPlayed: undefined,
      playtime: rawgGame.playtime,
      platform: rawgGame.parent_platforms?.[0]?.platform.name as any || "PC",
      platforms: rawgGame.platforms.map((p) => ({
        id: String(p.platform.id),
        name: p.platform.name,
      })),
      genres: rawgGame.genres.map((g) => ({
        id: String(g.id),
        name: g.name,
      })),
      summary: rawgGame.description_raw,
      releaseDate: rawgGame.released,
      total_rating: rawgGame.rating,
      total_rating_count: rawgGame.ratings_count,
      metacritic: rawgGame.metacritic,
      status: rawgGame.tba ? "want_to_play" : undefined,
    };
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
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      ordering: "-rating",
      page,
      page_size: pageSize,
      metacritic: "80,100",
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

  static async getUpcomingGames(page: number = 1, pageSize: number = 20) {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      dates: `${today},${nextYear.toISOString().split("T")[0]}`,
      ordering: "-added",
      page,
      page_size: pageSize,
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

  static async getTrendingGames(page: number = 1, pageSize: number = 20) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const response = await this.fetchFromRAWG<RAWGResponse<RAWGGame>>("/games", {
      dates: `${thirtyDaysAgo.toISOString().split("T")[0]},${new Date().toISOString().split("T")[0]}`,
      ordering: "-added",
      page,
      page_size: pageSize,
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