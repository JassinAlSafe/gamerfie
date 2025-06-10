import { GameServiceError } from '../types/errors';
import { 
  GameQueryParams, 
  FetchGamesResponse, 
  Platform, 
  SortOption,
  GameExtended
} from '../types/gameService';

export class GameService {
  private static readonly GAMES_PER_PAGE = 48;
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  private static validateApiBase(): void {
    if (!this.API_BASE) {
      throw new GameServiceError('API_BASE environment variable is not configured');
    }
  }

  static async fetchGames({
    page = 1,
    platformId = 'all',
    searchTerm = '',
    sortBy = 'popularity'
  }: GameQueryParams): Promise<FetchGamesResponse> {
    this.validateApiBase();
    
    try {
      const query = this.buildQuery({ page, platformId, searchTerm, sortBy });
      
      const queryForCount = query.replace(/fields\s[^;]+;/i, 'fields id;');

      const [gamesResponse, countResponse] = await Promise.all([
        fetch(`${this.API_BASE}/api/igdb-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ endpoint: 'games', query })
        }),
        fetch(`${this.API_BASE}/api/igdb-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ endpoint: 'games/count', query: queryForCount })
        })
      ]);

      const games = await gamesResponse.json();
      const { count } = await countResponse.json();

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

  static async searchGames(searchTerm: string): Promise<GameExtended[]> {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const query = `
        fields 
          name,
          cover.url,
          cover.id,
          platforms.name,
          genres.name,
          total_rating,
          first_release_date,
          summary,
          category;
        search "${searchTerm}";
        where 
          cover != null & 
          version_parent = null;
        limit 10;
      `;

      const response = await fetch(`${this.API_BASE}/api/igdb-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: 'games', query })
      });

      if (!response.ok) {
        console.error('Search failed:', await response.text());
        throw new GameServiceError('Failed to search games');
      }

      const games = await response.json();
      return games.map(this.processGameData);
    } catch (error) {
      console.error('GameService searchGames error:', error);
      throw new GameServiceError('Failed to search games', error);
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
      'cover.id',
      'cover.url',
      'platforms.name',
      'genres.name',
      'summary',
      'first_release_date',
      'total_rating',
      'total_rating_count',
      'artworks.url',
      'screenshots.url',
      'websites',
      'involved_companies.company.name'
    ].join(',');

    let query = `fields ${fields};`;

    // Add search if provided (search results are automatically sorted by relevancy)
    if (searchTerm) {
      query += ` search "${searchTerm}";`;
      query += ` where cover != null;`; // Ensure games have covers
      query += ` limit ${this.GAMES_PER_PAGE};`;
      query += ` offset ${offset};`;
      return query;
    }

    // If not searching, we can use filters and sorting
    query += ' where cover != null'; // Base condition

    if (platformId !== 'all') {
      query += ` & platforms = (${platformId})`;
    }

    query += ';'; // Close where clause

    // Add sorting (only when not searching)
    const sortMapping: Record<SortOption, string> = {
      name: 'name asc',
      release: 'first_release_date desc',
      rating: 'total_rating desc',
      popularity: 'total_rating_count desc'
    };
    
    const sortClause = sortMapping[sortBy as SortOption] || 'total_rating_count desc';
    query += ` sort ${sortClause};`;

    // Add pagination
    query += ` limit ${this.GAMES_PER_PAGE};`;
    query += ` offset ${offset};`;

    return query;
  }

  private static processGameData(game: any): GameExtended {
    return {
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : undefined,
      platforms: game.platforms ?? [],
      genres: game.genres ?? [],
      summary: game.summary,
      first_release_date: game.first_release_date,
      total_rating: game.total_rating,
      artworks: game.artworks ?? [],
      screenshots: game.screenshots ?? [],
      websites: game.websites ?? [],
      involved_companies: game.involved_companies ?? []
    };
  }

  static async fetchGameById(id: number): Promise<GameExtended | null> {
    const query = `
      fields name,cover.url,cover.id,platforms.name,genres.name,summary,first_release_date,
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