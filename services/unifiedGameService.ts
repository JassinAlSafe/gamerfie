import { Game } from "@/types";
import { IGDBService } from "./igdb";
import { RAWGService } from "./rawgService";
import { createClient } from "@/utils/supabase/client";

export type DataSource = 'igdb' | 'rawg' | 'auto';
export type SearchStrategy = 'combined' | 'igdb_first' | 'rawg_first' | 'parallel';

interface SearchResult {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sources: DataSource[];
  cacheHit?: boolean;
}

interface CacheEntry {
  data: SearchResult;
  timestamp: number;
  strategy: SearchStrategy;
  sources: DataSource[];
}

interface UserPreferences {
  preferredSource: DataSource;
  searchStrategy: SearchStrategy;
  cacheEnabled: boolean;
  fallbackEnabled: boolean;
}

// Type for IGDB games before transformation
interface IGDBGameData {
  id: number;
  name: string;
  cover: { id: number; url: string; } | null;
  platforms: any[];
  genres: any[];
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  screenshots?: any[];
  videos?: any[];
}

export class UnifiedGameService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  
  private static defaultPreferences: UserPreferences = {
    preferredSource: 'auto',
    searchStrategy: 'combined',
    cacheEnabled: true,
    fallbackEnabled: true
  };

  /**
   * Transform IGDB game data to match our Game interface
   */
  private static transformIGDBGame(igdbGame: IGDBGameData): Game {
    return {
      ...igdbGame,
      id: `igdb_${igdbGame.id}`, // Prefix with source to avoid ID conflicts
      source_id: igdbGame.id.toString(), // Keep original ID for API calls
      cover: igdbGame.cover ? {
        id: igdbGame.cover.id.toString(),
        url: igdbGame.cover.url
      } : undefined, // Transform IGDBCover | null to { id: string; url: string; } | undefined
      dataSource: 'igdb' as const
    } as Game;
  }

  /**
   * Get user preferences from Supabase or localStorage
   */
  private static async getUserPreferences(): Promise<UserPreferences> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if search_preferences column exists by querying user settings
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();
          
        // If query fails or no profile, fall back to localStorage/defaults
        if (!error && profile?.settings?.search_preferences) {
          return { ...this.defaultPreferences, ...profile.settings.search_preferences };
        }
      }
      
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('gameSearchPreferences');
        if (saved) {
          try {
            return { ...this.defaultPreferences, ...JSON.parse(saved) };
          } catch (parseError) {
            console.warn('Failed to parse saved preferences:', parseError);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    
    return this.defaultPreferences;
  }

  /**
   * Save user preferences to Supabase, cookies, and localStorage
   */
  static async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const CookieManager = (await import('@/utils/cookieManager')).default;
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get current settings first to merge with new preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();
          
        const currentSettings = profile?.settings || {};
        const updatedSettings = {
          ...currentSettings,
          search_preferences: {
            ...currentSettings.search_preferences,
            ...preferences
          }
        };
        
        await supabase
          .from('profiles')
          .update({ settings: updatedSettings })
          .eq('id', user.id);
      }
      
      // Save to cookies if functional consent given
      if (CookieManager.hasConsent('functional')) {
        CookieManager.setSearchPreferences(preferences);
      }
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('gameSearchPreferences', JSON.stringify(preferences));
      }
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
      // Still save to localStorage if other methods fail
      if (typeof window !== 'undefined') {
        localStorage.setItem('gameSearchPreferences', JSON.stringify(preferences));
      }
    }
  }

  /**
   * Generate cache key for requests
   */
  private static getCacheKey(query: string, page: number, pageSize: number, strategy: SearchStrategy): string {
    return `search:${query}:${page}:${pageSize}:${strategy}`;
  }

  /**
   * Get cached search result
   */
  private static getCachedResult(key: string): SearchResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return { ...entry.data, cacheHit: true };
  }

  /**
   * Cache search result with proper type safety
   */
  private static setCachedResult(key: string, result: SearchResult, strategy: SearchStrategy, sources: DataSource[]): void {
    // Implement LRU cache behavior with proper type checking
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const iterator = this.cache.keys();
      const firstKey = iterator.next().value;
      
      // Type guard to ensure we have a valid key before deletion
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data: { ...result, cacheHit: false },
      timestamp: Date.now(),
      strategy,
      sources
    });
  }

  /**
   * Merge and deduplicate results from multiple sources
   */
  private static mergeResults(igdbResult?: SearchResult, rawgResult?: SearchResult): SearchResult {
    const games: Game[] = [];
    const seenGameKeys = new Set<string>();
    const sources: DataSource[] = [];
    
    // Add IGDB results first (higher quality metadata)
    if (igdbResult) {
      sources.push('igdb');
      igdbResult.games.forEach(game => {
        const gameKey = `${game.dataSource || 'igdb'}_${game.source_id || game.id}`;
        if (!seenGameKeys.has(gameKey)) {
          seenGameKeys.add(gameKey);
          games.push({ ...game, dataSource: 'igdb' });
        }
      });
    }
    
    // Add RAWG results, avoiding duplicates
    if (rawgResult) {
      sources.push('rawg');
      rawgResult.games.forEach(game => {
        const gameKey = `${game.dataSource || 'rawg'}_${game.source_id || game.id}`;
        
        // Skip if we've already seen this exact game
        if (seenGameKeys.has(gameKey)) {
          return;
        }
        
        // Try to match by name similarity for cross-source deduplication
        const isDuplicate = games.some(existingGame => 
          this.calculateSimilarity(existingGame.name.toLowerCase(), game.name.toLowerCase()) > 0.85
        );
        
        if (!isDuplicate) {
          seenGameKeys.add(gameKey);
          games.push({ ...game, dataSource: 'rawg' });
        }
      });
    }
    
    // Sort by relevance (IGDB first, then by rating)
    games.sort((a, b) => {
      if (a.dataSource === 'igdb' && b.dataSource === 'rawg') return -1;
      if (a.dataSource === 'rawg' && b.dataSource === 'igdb') return 1;
      return (b.total_rating || 0) - (a.total_rating || 0);
    });
    
    return {
      games,
      total: Math.max(igdbResult?.total || 0, rawgResult?.total || 0),
      page: igdbResult?.page || rawgResult?.page || 1,
      pageSize: igdbResult?.pageSize || rawgResult?.pageSize || 20,
      hasNextPage: igdbResult?.hasNextPage || rawgResult?.hasNextPage || false,
      hasPreviousPage: igdbResult?.hasPreviousPage || rawgResult?.hasPreviousPage || false,
      sources
    };
  }

  /**
   * Calculate string similarity for deduplication
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j += 1) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Search using IGDB with fallback to RAWG
   */
  private static async searchWithIGDBFirst(query: string, page: number, pageSize: number): Promise<SearchResult> {
    try {
      // Try IGDB first
      const igdbGames = await IGDBService.getGames(page, pageSize, { 
        search: query, 
        page, 
        limit: pageSize, 
        sortBy: 'popularity' 
      });
      
      // Transform IGDB games to match Game interface
      const transformedGames = igdbGames.games.map((game: any) => this.transformIGDBGame(game));
      
      return {
        games: transformedGames,
        total: igdbGames.totalCount,
        page: igdbGames.currentPage,
        pageSize,
        hasNextPage: igdbGames.hasNextPage,
        hasPreviousPage: igdbGames.hasPreviousPage,
        sources: ['igdb']
      };
    } catch (igdbError) {
      console.warn('IGDB search failed, falling back to RAWG:', igdbError);
      
      try {
        const rawgResult = await RAWGService.searchGames(query, page, pageSize);
        return {
          ...rawgResult,
          games: rawgResult.games.map(game => ({ ...game, dataSource: 'rawg' as const })),
          sources: ['rawg']
        };
      } catch (rawgError) {
        console.error('Both IGDB and RAWG searches failed:', { igdbError, rawgError });
        throw new Error('All search services are unavailable');
      }
    }
  }

  /**
   * Search using RAWG with fallback to IGDB
   */
  private static async searchWithRAWGFirst(query: string, page: number, pageSize: number): Promise<SearchResult> {
    try {
      // Try RAWG first
      const rawgResult = await RAWGService.searchGames(query, page, pageSize);
      return {
        ...rawgResult,
        games: rawgResult.games.map(game => ({ ...game, dataSource: 'rawg' as const })),
        sources: ['rawg']
      };
    } catch (rawgError) {
      console.warn('RAWG search failed, falling back to IGDB:', rawgError);
      
      try {
        const igdbGames = await IGDBService.getGames(page, pageSize, { 
          search: query, 
          page, 
          limit: pageSize, 
          sortBy: 'popularity' 
        });
        
        // Transform IGDB games to match Game interface
        const transformedGames = igdbGames.games.map((game: any) => this.transformIGDBGame(game));
        
        return {
          games: transformedGames,
          total: igdbGames.totalCount,
          page: igdbGames.currentPage,
          pageSize,
          hasNextPage: igdbGames.hasNextPage,
          hasPreviousPage: igdbGames.hasPreviousPage,
          sources: ['igdb']
        };
      } catch (igdbError) {
        console.error('Both RAWG and IGDB searches failed:', { rawgError, igdbError });
        throw new Error('All search services are unavailable');
      }
    }
  }

  /**
   * Search using both APIs in parallel and merge results
   */
  private static async searchCombined(query: string, page: number, pageSize: number): Promise<SearchResult> {
    const promises = [
      IGDBService.getGames(page, Math.ceil(pageSize / 2), { 
        search: query, 
        page, 
        limit: Math.ceil(pageSize / 2), 
        sortBy: 'popularity' 
      }).then(result => ({
        games: result.games.map((game: any) => this.transformIGDBGame(game)),
        total: result.totalCount,
        page: result.currentPage,
        pageSize: Math.ceil(pageSize / 2),
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        sources: ['igdb' as const]
      })).catch(error => {
        console.warn('IGDB search failed in combined mode:', error);
        return null;
      }),
      
      RAWGService.searchGames(query, page, Math.ceil(pageSize / 2)).then(result => ({
        ...result,
        games: result.games.map(game => ({ ...game, dataSource: 'rawg' as const })),
        sources: ['rawg' as const]
      })).catch(error => {
        console.warn('RAWG search failed in combined mode:', error);
        return null;
      })
    ];
    
    const [igdbResult, rawgResult] = await Promise.all(promises);
    
    if (!igdbResult && !rawgResult) {
      throw new Error('All search services are unavailable');
    }
    
    return this.mergeResults(igdbResult || undefined, rawgResult || undefined);
  }

  /**
   * Main search method with intelligent strategy selection
   */
  static async searchGames(
    query: string, 
    page: number = 1, 
    pageSize: number = 20,
    options?: {
      strategy?: SearchStrategy;
      useCache?: boolean;
      source?: DataSource;
    }
  ): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
      return {
        games: [],
        total: 0,
        page,
        pageSize,
        hasNextPage: false,
        hasPreviousPage: false,
        sources: []
      };
    }
    
    const preferences = await this.getUserPreferences();
    const strategy = options?.strategy || preferences.searchStrategy;
    const useCache = options?.useCache ?? preferences.cacheEnabled;
    
    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(query, page, pageSize, strategy);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    let result: SearchResult;
    
    try {
      switch (strategy) {
        case 'igdb_first':
          result = await this.searchWithIGDBFirst(query, page, pageSize);
          break;
        case 'rawg_first':
          result = await this.searchWithRAWGFirst(query, page, pageSize);
          break;
        case 'combined':
          result = await this.searchCombined(query, page, pageSize);
          break;
        case 'parallel':
          result = await this.searchCombined(query, page, pageSize);
          break;
        default:
          result = await this.searchCombined(query, page, pageSize);
      }
      
      // Cache the result
      if (useCache) {
        const cacheKey = this.getCacheKey(query, page, pageSize, strategy);
        this.setCachedResult(cacheKey, result, strategy, result.sources);
      }
      
      return result;
    } catch (error) {
      console.error('Unified search failed:', error);
      throw error;
    }
  }

  /**
   * Get popular games with fallback strategy
   */
  static async getPopularGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    const preferences = await this.getUserPreferences();
    const targetSource = source || preferences.preferredSource;
    
    try {
      if (targetSource === 'igdb' || targetSource === 'auto') {
        const games = await IGDBService.getPopularGames(limit);
        // IGDBService already returns games with igdb_ prefix, no need to add it again
        return games.map(game => ({
          ...game,
          source_id: game.id.replace('igdb_', ''), // Extract numeric ID for source_id
          dataSource: 'igdb' as const
        }));
      } else {
        const result = await RAWGService.getPopularGames(1, limit);
        // Ensure consistent ID prefixing for RAWG games
        return result.games.map(game => ({
          ...game,
          id: `rawg_${game.id}`,
          source_id: game.id,
          dataSource: 'rawg' as const
        }));
      }
    } catch (primaryError) {
      if (preferences.fallbackEnabled && targetSource !== 'rawg') {
        console.warn('Primary source failed, falling back:', primaryError);
        try {
          const result = await RAWGService.getPopularGames(1, limit);
          // Ensure consistent ID prefixing for RAWG fallback games
          return result.games.map(game => ({
            ...game,
            id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
            source_id: game.id.replace('rawg_', ''),
            dataSource: 'rawg' as const
          }));
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw primaryError;
        }
      }
      throw primaryError;
    }
  }

  /**
   * Get trending games with fallback strategy
   */
  static async getTrendingGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    const preferences = await this.getUserPreferences();
    const targetSource = source || preferences.preferredSource;
    
    try {
      if (targetSource === 'igdb' || targetSource === 'auto') {
        const games = await IGDBService.getTrendingGames(limit);
        // IGDBService already returns games with igdb_ prefix, no need to add it again
        return games.map(game => ({
          ...game,
          source_id: game.id.replace('igdb_', ''), // Extract numeric ID for source_id
          dataSource: 'igdb' as const
        }));
      } else {
        const result = await RAWGService.getTrendingGames(1, limit);
        // Ensure consistent ID prefixing for RAWG games
        return result.games.map(game => ({
          ...game,
          id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
          source_id: game.id.replace('rawg_', ''),
          dataSource: 'rawg' as const
        }));
      }
    } catch (primaryError) {
      if (preferences.fallbackEnabled && targetSource !== 'rawg') {
        try {
          const result = await RAWGService.getTrendingGames(1, limit);
          console.log(`Fallback successful: fetched ${result.games.length} trending games from RAWG`);
          // Ensure consistent ID prefixing for RAWG fallback games
          return result.games.map(game => ({
            ...game,
            id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
            source_id: game.id.replace('rawg_', ''),
            dataSource: 'rawg' as const
          }));
        } catch (fallbackError) {
          console.error('Trending games: All sources failed, returning empty array');
          return [];
        }
      }
      
      // If no fallback is enabled or fallback failed, return empty array
      console.error('Trending games: No fallback available, returning empty array');
      return [];
    }
  }

  /**
   * Get upcoming games with fallback strategy
   */
  static async getUpcomingGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    const preferences = await this.getUserPreferences();
    const targetSource = source || preferences.preferredSource;
    
    try {
      if (targetSource === 'igdb' || targetSource === 'auto') {
        const games = await IGDBService.getUpcomingGames(limit);
        // IGDBService already returns games with igdb_ prefix, no need to add it again
        return games.map(game => ({
          ...game,
          source_id: game.id.replace('igdb_', ''), // Extract numeric ID for source_id
          dataSource: 'igdb' as const
        }));
      } else {
        const result = await RAWGService.getUpcomingGames(1, limit);
        // Ensure consistent ID prefixing for RAWG games
        return result.games.map(game => ({
          ...game,
          id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
          source_id: game.id.replace('rawg_', ''),
          dataSource: 'rawg' as const
        }));
      }
    } catch (primaryError) {
      if (preferences.fallbackEnabled && targetSource !== 'rawg') {
        try {
          const result = await RAWGService.getUpcomingGames(1, limit);
          console.log(`Fallback successful: fetched ${result.games.length} upcoming games from RAWG`);
          // Ensure consistent ID prefixing for RAWG fallback games
          return result.games.map(game => ({
            ...game,
            id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
            source_id: game.id.replace('rawg_', ''),
            dataSource: 'rawg' as const
          }));
        } catch (fallbackError) {
          console.error('Upcoming games: All sources failed, returning empty array');
          return [];
        }
      }
      
      // If no fallback is enabled or fallback failed, return empty array
      console.error('Upcoming games: No fallback available, returning empty array');
      return [];
    }
  }

  /**
   * Get recent games with fallback strategy
   */
  static async getRecentGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    const preferences = await this.getUserPreferences();
    const targetSource = source || preferences.preferredSource;
    
    try {
      if (targetSource === 'igdb' || targetSource === 'auto') {
        const games = await IGDBService.getRecentGames(limit);
        // IGDBService already returns games with igdb_ prefix, no need to add it again
        return games.map(game => ({
          ...game,
          source_id: game.id.replace('igdb_', ''), // Extract numeric ID for source_id
          dataSource: 'igdb' as const
        }));
      } else {
        const result = await RAWGService.getRecentGames(1, limit);
        // Ensure consistent ID prefixing for RAWG games
        return result.games.map(game => ({
          ...game,
          id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
          source_id: game.id.replace('rawg_', ''),
          dataSource: 'rawg' as const
        }));
      }
    } catch (primaryError) {
      if (preferences.fallbackEnabled && targetSource !== 'rawg') {
        try {
          const result = await RAWGService.getRecentGames(1, limit);
          console.log(`Fallback successful: fetched ${result.games.length} recent games from RAWG`);
          // Ensure consistent ID prefixing for RAWG fallback games
          return result.games.map(game => ({
            ...game,
            id: `rawg_${game.id.replace('rawg_', '')}`, // Avoid double prefixing
            source_id: game.id.replace('rawg_', ''),
            dataSource: 'rawg' as const
          }));
        } catch (fallbackError) {
          console.error('Recent games: All sources failed, returning empty array');
          return [];
        }
      }
      
      // If no fallback is enabled or fallback failed, return empty array
      console.error('Recent games: No fallback available, returning empty array');
      return [];
    }
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        strategy: entry.strategy,
        sources: entry.sources,
        age: Date.now() - entry.timestamp
      }))
    };
  }

  /**
   * Test API connectivity
   */
  static async testConnectivity(): Promise<{ igdb: boolean; rawg: boolean }> {
    const results = await Promise.allSettled([
      IGDBService.testConnection(),
      fetch('https://api.rawg.io/api/games?key=' + (process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY)).then(r => r.ok)
    ]);
    
    return {
      igdb: results[0].status === 'fulfilled' && results[0].value === true,
      rawg: results[1].status === 'fulfilled' && results[1].value === true
    };
  }

  /**
   * Parse prefixed game ID to extract source and original ID
   */
  private static parseGameId(gameId: string): { source: DataSource; originalId: string } {
    if (gameId.startsWith('igdb_')) {
      return { source: 'igdb', originalId: gameId.replace('igdb_', '') };
    }
    if (gameId.startsWith('rawg_')) {
      return { source: 'rawg', originalId: gameId.replace('rawg_', '') };
    }
    
    // For backward compatibility, treat unprefixed IDs as auto-detect
    return { source: 'auto', originalId: gameId };
  }

  /**
   * Get game details by ID with fallback support
   */
  static async getGameDetails(gameId: string, source?: DataSource): Promise<Game | null> {
    const preferences = await this.getUserPreferences();
    
    // Parse the game ID to determine source and original ID
    const { source: detectedSource, originalId } = this.parseGameId(gameId);
    const targetSource = source || detectedSource || preferences.preferredSource;
    
    try {
      if (targetSource === 'igdb' || targetSource === 'auto') {
        const gameDetails = await IGDBService.fetchGameDetails(originalId);
        if (gameDetails) {
          // IGDBService.fetchGameDetails already returns the game with igdb_ prefix
          // So we don't need to add it again to avoid double prefixing
          return {
            ...gameDetails,
            // Keep the existing ID from IGDBService which already has the prefix
            source_id: originalId, // Use the original numeric ID
            dataSource: 'igdb' as const
          } as Game;
        }
      }
      
      if (targetSource === 'rawg' || (targetSource === 'auto' && preferences.fallbackEnabled)) {
        const gameDetails = await RAWGService.getGameDetails(originalId);
        if (gameDetails) {
          return {
            ...gameDetails,
            id: `rawg_${gameDetails.id}`, // Ensure consistent prefixing
            source_id: gameDetails.id.toString(),
            dataSource: 'rawg' as const
          } as Game;
        }
      }
      
      return null;
    } catch (primaryError) {
      if (preferences.fallbackEnabled && targetSource !== 'rawg' && targetSource !== 'igdb') {
        try {
          // Try the other source as fallback only if we're in auto mode
          if (targetSource === 'auto') {
            const gameDetails = await RAWGService.getGameDetails(originalId);
            if (gameDetails) {
              console.log(`Fallback successful: fetched game details from RAWG for ID: ${originalId}`);
              return {
                ...gameDetails,
                id: `rawg_${gameDetails.id}`,
                source_id: gameDetails.id.toString(),
                dataSource: 'rawg' as const
              } as Game;
            }
          }
        } catch (fallbackError) {
          console.error(`Game details fallback failed for ID ${gameId}`);
        }
      }
      
      throw new Error(`Failed to fetch game details for ID: ${gameId}`);
    }
  }
} 