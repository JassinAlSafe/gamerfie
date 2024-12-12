import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Game, FetchGamesResponse, GameQueryParams, SortOption } from '@/types/game'
import { GameServiceError } from '@/types/errors';

export class GameService {
  private static readonly GAMES_PER_PAGE = 48;
  private static readonly supabase = createClientComponentClient();
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  static async fetchGames({
    page = 1,
    platformId = 'all',
    searchTerm = '',
    sortBy = 'popularity'
  }: GameQueryParams): Promise<FetchGamesResponse> {
    try {
      const query = this.buildQuery({ page, platformId, searchTerm, sortBy });
      
      // First get the count
      const countQuery = query.replace(/fields.*?;/, 'fields id;').replace(/limit.*?;/, '').replace(/offset.*?;/, '');
      
      const [gamesResponse, countResponse] = await Promise.all([
        fetch(`${this.API_BASE}/api/igdb-proxy`, {
          method: 'POST',
          body: JSON.stringify({ endpoint: 'games', query })
        }),
        fetch(`${this.API_BASE}/api/igdb-proxy`, {
          method: 'POST',
          body: JSON.stringify({ endpoint: 'games/count', query: countQuery })
        })
      ]);

      if (!gamesResponse.ok || !countResponse.ok) {
        throw new GameServiceError('IGDB API Error');
      }

      const games = await gamesResponse.json();
      const { count } = await countResponse.json();

      if (!games) throw new GameServiceError('No data received from IGDB');

      return {
        games: games.map(this.processGameData),
        total: count,
        page,
        pageSize: this.GAMES_PER_PAGE
      };
    } catch (error) {
      console.error('GameService fetchGames error:', error);
      throw new GameServiceError('Failed to fetch games', error);
    }
  }

  private static buildQuery({ 
    page = 1,
    platformId = 'all',
    searchTerm = '',
    sortBy = 'popularity'
  }: GameQueryParams): string {
    const offset = (page - 1) * this.GAMES_PER_PAGE;
    
    // Build the base query
    const fields = [
      'name',
      'cover.url',
      'platforms.name',
      'genres.name',
      'summary',
      'first_release_date',
      'total_rating',
      'total_rating_count'
    ].join(',');

    let query = `fields ${fields};`;

    // Add search if provided (search results are automatically sorted by relevancy)
    if (searchTerm) {
      query += ` search "${searchTerm}";`;
      query += ` limit ${this.GAMES_PER_PAGE};`;
      query += ` offset ${offset};`;
      return query;
    }

    // If not searching, we can use filters and sorting
    if (platformId !== 'all') {
      query += ` where platforms = (${platformId});`;
    }

    // Add sorting (only when not searching)
    const sortMapping: Record<SortOption, string> = {
      name: 'name asc',
      releaseDate: 'first_release_date desc',
      popularity: 'total_rating_count desc'
    };
    query += ` sort ${sortMapping[sortBy]};`;

    // Add pagination
    query += ` limit ${this.GAMES_PER_PAGE};`;
    query += ` offset ${offset};`;

    return query;
  }

  private static processGameData(game: Game) {
    return {
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : null,
      platforms: game.platforms ?? [],
      genres: game.genres ?? [],
      summary: game.summary,
      first_release_date: game.first_release_date,
      total_rating: game.total_rating,
      artworks: game.artworks,
      screenshots: game.screenshots,
      websites: game.websites,
      involved_companies: game.involved_companies
    };
  }

  static async fetchGameById(id: number): Promise<Game> {
    const query = `
      fields name,cover.url,platforms.name,genres.name,summary,first_release_date,
      total_rating,total_rating_count,artworks.url,screenshots.url,
      websites.*,involved_companies.company.name,involved_companies.*;
      where id = ${id};
    `;

    const response = await fetch(`${this.API_BASE}/api/igdb-proxy`, {
      method: 'POST',
      body: JSON.stringify({ endpoint: 'games', query })
    });

    if (!response.ok) throw new GameServiceError('Failed to fetch game details');
    
    const games = await response.json();
    if (!games || games.length === 0) return null;
    
    return this.processGameData(games[0]);
  }

  static async fetchPlatforms(): Promise<Platform[]> {
    try {
      const query = "fields id,name,category; where category = (1,2,3,4,5,6); sort name asc; limit 500;";
      
      const response = await fetch(`${this.API_BASE}/api/igdb-proxy`, {
        method: 'POST',
        body: JSON.stringify({
          endpoint: 'platforms',
          query
        })
      });

      if (!response.ok) throw new GameServiceError('Failed to fetch platforms');
      
      const platforms = await response.json();
      
      // Filter out duplicate platform names
      return platforms.reduce((acc: Platform[], platform: Platform) => {
        if (!acc.find(p => p.name === platform.name)) {
          acc.push(platform);
        }
        return acc;
      }, []);
    } catch (error) {
      console.error('GameService fetchPlatforms error:', error);
      throw new GameServiceError('Failed to fetch platforms', error);
    }
  }
} 