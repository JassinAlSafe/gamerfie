import { Game } from "@/types";
import { IGDBService } from "./igdb";
import { RAWGService } from "./rawgService";
import { createClient } from "@/utils/supabase/client";

export type DataSource = 'igdb' | 'rawg' | 'auto' | 'hybrid' | 'smart';
export type SearchStrategy = 'combined' | 'igdb_first' | 'rawg_first' | 'parallel' | 'smart' | 'hybrid';
export type GameRequestType = 'trending' | 'popular' | 'upcoming' | 'recent' | 'search';

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
  platforms: Array<{ id: number; name: string; category?: number; }>;
  genres: Array<{ id: number; name: string; slug?: string; }>;
  summary?: string;
  first_release_date?: number;
  total_rating?: number;
  screenshots?: Array<{ id: number; url: string; width?: number; height?: number; }>;
  videos?: Array<{ id: number; video_id?: string; name?: string; }>;
}

export class UnifiedGameService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  
  private static defaultPreferences: UserPreferences = {
    preferredSource: 'auto',
    searchStrategy: 'smart',
    cacheEnabled: true,
    fallbackEnabled: true
  };

  /**
   * API Health tracking for smart decisions
   */
  private static apiHealthStatus = {
    igdb: { isHealthy: true, lastChecked: 0, failures: 0, avgResponseTime: 0 },
    rawg: { isHealthy: true, lastChecked: 0, failures: 0, avgResponseTime: 0 }
  };

  /**
   * Smart source selection based on request type and API strengths
   */
  private static getOptimalSource(requestType: GameRequestType): DataSource {
    // Define each API's strengths based on data quality and performance analysis
    const sourceStrengths: Record<GameRequestType, DataSource> = {
      popular: 'igdb',    // IGDB has superior popularity metrics (total_rating_count, hypes)
      trending: 'igdb',   // IGDB has better trending indicators (hypes, recent ratings)
      upcoming: 'igdb',   // IGDB has better date filtering and quality control for upcoming games
      recent: 'igdb',     // IGDB has better quality control for recent releases with fixed 2024 date range
      search: 'igdb'      // IGDB has better metadata quality for search results
    };
    
    const preferredSource = sourceStrengths[requestType];
    
    // Check API health - if preferred source is down, use alternative
    const healthStatus = this.apiHealthStatus[preferredSource as keyof typeof this.apiHealthStatus];
    if (!healthStatus?.isHealthy && Date.now() - healthStatus?.lastChecked < 5 * 60 * 1000) {
      // If preferred source failed in last 5 minutes, use alternative
      return preferredSource === 'igdb' ? 'rawg' : 'igdb';
    }
    
    return preferredSource;
  }

  /**
   * Update API health status based on request results
   */
  private static updateApiHealth(source: 'igdb' | 'rawg', success: boolean, responseTime: number = 0) {
    const health = this.apiHealthStatus[source];
    health.lastChecked = Date.now();
    
    if (success) {
      health.failures = Math.max(0, health.failures - 1); // Recover gradually
      health.isHealthy = health.failures < 3; // Mark healthy if less than 3 recent failures
      health.avgResponseTime = (health.avgResponseTime + responseTime) / 2;
    } else {
      health.failures += 1;
      health.isHealthy = health.failures < 3; // Mark unhealthy after 3 failures
    }
  }

  /**
   * Transform IGDB game data to match our Game interface
   */
  private static transformIGDBGame(igdbGame: IGDBGameData): Game {
    return {
      id: `igdb_${igdbGame.id}`,
      name: igdbGame.name,
      summary: igdbGame.summary,
      cover_url: igdbGame.cover?.url,
      rating: igdbGame.total_rating,
      releaseDate: igdbGame.first_release_date ? new Date(igdbGame.first_release_date * 1000).toISOString().split('T')[0] : undefined,
      platforms: igdbGame.platforms?.map(p => ({
        id: p.id.toString(),
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, '-'),
        category: p.category?.toString()
      })),
      genres: igdbGame.genres?.map(g => ({
        id: g.id.toString(),
        name: g.name,
        slug: g.slug || g.name.toLowerCase().replace(/\s+/g, '-')
      })),
      // Extended properties for IGDB
      source_id: igdbGame.id.toString(),
      dataSource: 'igdb' as const,
      cover: igdbGame.cover ? {
        id: igdbGame.cover.id.toString(),
        url: igdbGame.cover.url
      } : undefined,
      screenshots: igdbGame.screenshots?.map(s => ({
        id: s.id.toString(),
        url: s.url,
        width: s.width,
        height: s.height
      })),
      videos: igdbGame.videos?.map(v => ({
        id: v.id.toString(),
        video_id: v.video_id,
        name: v.name || 'Untitled Video',
        url: v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : '',
        thumbnail_url: v.video_id ? `https://img.youtube.com/vi/${v.video_id}/maxresdefault.jpg` : '',
        provider: 'youtube' as const
      }))
    };
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
   * Advanced hybrid merging that combines the best data from both sources for each game
   */
  private static hybridMergeGameData(igdbGame: Game, rawgGame: Game): Game {
    // Create hybrid game by taking the best fields from each source
    const hybridGame: Game = {
      // Identifiers - prefer IGDB for consistency
      id: igdbGame.id || rawgGame.id,
      source_id: igdbGame.source_id || rawgGame.source_id,
      
      // Basic info - prefer IGDB for accuracy
      name: igdbGame.name || rawgGame.name,
      title: igdbGame.title || rawgGame.title,
      
      // Visual assets - prefer IGDB covers and backgrounds for better CSP compliance
      cover_url: igdbGame.cover_url || rawgGame.cover_url,
      background_image: igdbGame.background_image || rawgGame.background_image, // IGDB first to avoid CSP issues
      cover: igdbGame.cover || rawgGame.cover,
      
      // Media arrays - merge both sources for comprehensive coverage
      screenshots: [...(igdbGame.screenshots || []), ...(rawgGame.screenshots || [])].
        filter((screenshot, index, array) => 
          array.findIndex(s => s.url === screenshot.url) === index
        ).slice(0, 10), // Limit to 10 unique screenshots
      
      artworks: [...(igdbGame.artworks || []), ...(rawgGame.artworks || [])].
        filter((artwork, index, array) => 
          array.findIndex(a => a.url === artwork.url) === index
        ).slice(0, 8), // Limit to 8 unique artworks
      
      videos: [...(igdbGame.videos || []), ...(rawgGame.videos || [])].
        filter((video, index, array) => 
          array.findIndex(v => v.video_id === video.video_id) === index
        ).slice(0, 6), // Limit to 6 unique videos
      
      // Ratings - prefer IGDB ratings, but use RAWG as fallback
      rating: igdbGame.rating || rawgGame.rating,
      total_rating: igdbGame.total_rating || rawgGame.total_rating,
      total_rating_count: igdbGame.total_rating_count || rawgGame.total_rating_count,
      metacritic: rawgGame.metacritic || igdbGame.metacritic, // RAWG often has more metacritic scores
      
      // Content - prefer longer, more detailed descriptions
      summary: (igdbGame.summary && igdbGame.summary.length > (rawgGame.summary?.length || 0)) 
        ? igdbGame.summary 
        : (rawgGame.summary || igdbGame.summary),
      storyline: igdbGame.storyline,
      
      // Metadata arrays - merge unique entries
      platforms: this.mergeUniqueArrays(
        igdbGame.platforms || [], 
        rawgGame.platforms || [], 
        'name'
      ),
      
      genres: this.mergeUniqueArrays(
        igdbGame.genres || [], 
        rawgGame.genres || [], 
        'name'
      ),
      
      // Dates - prefer IGDB's more accurate dates
      first_release_date: igdbGame.first_release_date || rawgGame.first_release_date,
      releaseDate: igdbGame.releaseDate || rawgGame.releaseDate,
      
      // Company info - prefer IGDB's structured data
      involved_companies: igdbGame.involved_companies,
      
      // IGDB-specific fields
      hype_count: igdbGame.hype_count,
      follows_count: igdbGame.follows_count,
      
      // Mark as hybrid source
      dataSource: 'hybrid' as const
    };
    
    return hybridGame;
  }
  
  /**
   * Merge arrays of objects, removing duplicates based on a key field
   */
  private static mergeUniqueArrays<T extends Record<string, any>>(
    array1: T[], 
    array2: T[], 
    keyField: keyof T
  ): T[] {
    const merged = [...array1];
    const seenKeys = new Set(array1.map(item => item[keyField]));
    
    array2.forEach(item => {
      if (!seenKeys.has(item[keyField])) {
        merged.push(item);
        seenKeys.add(item[keyField]);
      }
    });
    
    return merged;
  }
  
  /**
   * Find matching games between two result sets based on name similarity
   */
  private static findMatchingGames(igdbGames: Game[], rawgGames: Game[]): Array<{
    igdbGame: Game;
    rawgGame: Game;
    similarity: number;
  }> {
    const matches: Array<{ igdbGame: Game; rawgGame: Game; similarity: number }> = [];
    const usedRawgIndices = new Set<number>();
    
    igdbGames.forEach(igdbGame => {
      let bestMatch: { rawgGame: Game; similarity: number; index: number } | null = null;
      
      rawgGames.forEach((rawgGame, index) => {
        if (usedRawgIndices.has(index)) return;
        
        const similarity = this.calculateSimilarity(
          igdbGame.name.toLowerCase(), 
          rawgGame.name.toLowerCase()
        );
        
        if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = { rawgGame, similarity, index } as { rawgGame: Game; similarity: number; index: number };
        }
      });
      
      if (bestMatch) {
        const match = bestMatch as { rawgGame: Game; similarity: number; index: number };
        matches.push({
          igdbGame,
          rawgGame: match.rawgGame,
          similarity: match.similarity
        });
        usedRawgIndices.add(match.index);
      }
    });
    
    return matches;
  }
  
  /**
   * Merge and deduplicate results from multiple sources with hybrid enhancement
   */
  private static mergeResults(igdbResult?: SearchResult, rawgResult?: SearchResult, useHybridMerging: boolean = false): SearchResult {
    const games: Game[] = [];
    const seenGameKeys = new Set<string>();
    const sources: DataSource[] = [];
    
    if (!igdbResult && !rawgResult) {
      return {
        games: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
        sources: []
      };
    }
    
    // If hybrid merging is enabled and we have both sources
    if (useHybridMerging && igdbResult && rawgResult) {
      sources.push('hybrid');
      
      // Find matching games between sources for hybrid merging
      const matches = this.findMatchingGames(igdbResult.games, rawgResult.games);
      const usedIgdbIds = new Set<string>();
      const usedRawgIds = new Set<string>();
      
      // Create hybrid games from matches
      matches.forEach(({ igdbGame, rawgGame }) => {
        const hybridGame = this.hybridMergeGameData(igdbGame, rawgGame);
        games.push(hybridGame);
        usedIgdbIds.add(igdbGame.id);
        usedRawgIds.add(rawgGame.id);
      });
      
      // Add remaining IGDB games (no matches found)
      igdbResult.games.forEach(game => {
        if (!usedIgdbIds.has(game.id)) {
          games.push({ ...game, dataSource: 'igdb' });
        }
      });
      
      // Add remaining RAWG games (no matches found)
      rawgResult.games.forEach(game => {
        if (!usedRawgIds.has(game.id)) {
          games.push({ ...game, dataSource: 'rawg' });
        }
      });
      
    } else {
      // Standard merging logic (original behavior)
      
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
    }
    
    // Sort by relevance (hybrid first, then IGDB, then RAWG, then by rating)
    games.sort((a, b) => {
      if (a.dataSource === 'hybrid' && b.dataSource !== 'hybrid') return -1;
      if (a.dataSource !== 'hybrid' && b.dataSource === 'hybrid') return 1;
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
   * Smart game fetching with optimal source selection and health monitoring
   */
  private static async fetchGamesSmartly(
    requestType: GameRequestType,
    limit: number,
    source?: DataSource
  ): Promise<Game[]> {
    const preferences = await this.getUserPreferences();
    let targetSource = source || preferences.preferredSource;
    
    // If source is 'auto' or 'smart', use intelligent selection
    if (targetSource === 'auto' || targetSource === 'smart') {
      targetSource = this.getOptimalSource(requestType);
    }
    
    const startTime = Date.now();
    
    try {
      let games: Game[] = [];
      
      if (targetSource === 'igdb') {
        switch (requestType) {
          case 'popular':
            games = await IGDBService.getPopularGames(limit, 1); // Always use page 1 for category requests
            break;
          case 'trending':
            games = await IGDBService.getTrendingGames(limit);
            break;
          case 'upcoming':
            games = await IGDBService.getUpcomingGames(limit);
            break;
          case 'recent':
            games = await IGDBService.getRecentGames(limit);
            break;
        }
        
        // Mark success and update health
        this.updateApiHealth('igdb', true, Date.now() - startTime);
        
        return games.map(game => ({
          ...game,
          source_id: game.id.replace('igdb_', ''),
          dataSource: 'igdb' as const
        }));
        
      } else if (targetSource === 'rawg') {
        let result;
        switch (requestType) {
          case 'popular':
            result = await RAWGService.getPopularGames(1, limit);
            break;
          case 'trending':
            result = await RAWGService.getTrendingGames(1, limit);
            break;
          case 'upcoming':
            result = await RAWGService.getUpcomingGames(1, limit);
            break;
          case 'recent':
            result = await RAWGService.getRecentGames(1, limit);
            break;
        }
        
        // Mark success and update health
        this.updateApiHealth('rawg', true, Date.now() - startTime);
        
        return result?.games.map(game => ({
          ...game,
          id: `rawg_${game.id.replace('rawg_', '')}`,
          source_id: game.id.replace('rawg_', ''),
          dataSource: 'rawg' as const
        })) || [];
      }
      
      return [];
      
    } catch (primaryError) {
      console.warn(`${targetSource} failed for ${requestType}:`, primaryError);
      
      // Mark failure and update health
      this.updateApiHealth(targetSource as 'igdb' | 'rawg', false);
      
      // Try fallback if enabled
      if (preferences.fallbackEnabled) {
        const fallbackSource = targetSource === 'igdb' ? 'rawg' : 'igdb';
        console.log(`Falling back to ${fallbackSource} for ${requestType}`);
        
        try {
          return await this.fetchGamesSmartly(requestType, limit, fallbackSource);
        } catch (fallbackError) {
          console.error(`Fallback to ${fallbackSource} also failed:`, fallbackError);
          return [];
        }
      }
      
      return [];
    }
  }

  /**
   * Hybrid fetching that combines data from both sources for comprehensive results
   */
  private static async fetchGamesHybrid(
    requestType: GameRequestType,
    limit: number
  ): Promise<Game[]> {
    const startTime = Date.now();
    
    try {
      // Fetch from both sources in parallel for hybrid merging
      const [igdbResult, rawgResult] = await Promise.allSettled([
        // IGDB fetch
        (async () => {
          let games: Game[] = [];
          switch (requestType) {
            case 'popular':
              games = await IGDBService.getPopularGames(Math.ceil(limit * 0.7), 1); // 70% from IGDB, page 1
              break;
            case 'trending':
              games = await IGDBService.getTrendingGames(Math.ceil(limit * 0.7));
              break;
            case 'upcoming':
              games = await IGDBService.getUpcomingGames(Math.ceil(limit * 0.7));
              break;
            case 'recent':
              games = await IGDBService.getRecentGames(Math.ceil(limit * 0.7));
              break;
          }
          
          this.updateApiHealth('igdb', true, Date.now() - startTime);
          return {
            games: games.map(game => ({
              ...game,
              source_id: game.id.replace('igdb_', ''),
              dataSource: 'igdb' as const
            })),
            total: games.length,
            page: 1,
            pageSize: games.length,
            hasNextPage: false,
            hasPreviousPage: false,
            sources: ['igdb' as const]
          };
        })(),
        
        // RAWG fetch
        (async () => {
          let result;
          switch (requestType) {
            case 'popular':
              result = await RAWGService.getPopularGames(1, Math.ceil(limit * 0.5)); // 50% from RAWG
              break;
            case 'trending':
              result = await RAWGService.getTrendingGames(1, Math.ceil(limit * 0.5));
              break;
            case 'upcoming':
              result = await RAWGService.getUpcomingGames(1, Math.ceil(limit * 0.5));
              break;
            case 'recent':
              result = await RAWGService.getRecentGames(1, Math.ceil(limit * 0.5));
              break;
          }
          
          this.updateApiHealth('rawg', true, Date.now() - startTime);
          return {
            ...result,
            total: result?.total || 0,
            page: result?.page || 1,
            pageSize: result?.pageSize || limit,
            hasNextPage: result?.hasNextPage || false,
            hasPreviousPage: result?.hasPreviousPage || false,
            games: result?.games.map(game => ({
              ...game,
              id: `rawg_${game.id.replace('rawg_', '')}`,
              source_id: game.id.replace('rawg_', ''),
              dataSource: 'rawg' as const
            })) || [],
            sources: ['rawg' as DataSource]
          };
        })()
      ]);
      
      // Process results
      const igdbData = igdbResult.status === 'fulfilled' ? igdbResult.value : undefined;
      const rawgData = rawgResult.status === 'fulfilled' ? rawgResult.value : undefined;
      
      // Handle failures
      if (igdbResult.status === 'rejected') {
        console.warn(`IGDB failed for hybrid ${requestType}:`, igdbResult.reason);
        this.updateApiHealth('igdb', false);
      }
      if (rawgResult.status === 'rejected') {
        console.warn(`RAWG failed for hybrid ${requestType}:`, rawgResult.reason);
        this.updateApiHealth('rawg', false);
      }
      
      // If both failed, return empty array
      if (!igdbData && !rawgData) {
        console.error(`All sources failed for hybrid ${requestType}`);
        return [];
      }
      
      // Merge results with hybrid enhancement
      const mergedResult = this.mergeResults(igdbData, rawgData, true); // Enable hybrid merging
      
      console.log(`Hybrid ${requestType} fetch completed:`, {
        igdbGames: igdbData?.games.length || 0,
        rawgGames: rawgData?.games.length || 0,
        hybridGames: mergedResult.games.filter(g => g.dataSource === 'hybrid').length,
        totalGames: mergedResult.games.length,
        sources: mergedResult.sources
      });
      
      return mergedResult.games.slice(0, limit);
      
    } catch (error) {
      console.error(`Hybrid fetch failed for ${requestType}:`, error);
      return [];
    }
  }
  
  /**
   * Get popular games with smart source selection and optional hybrid merging
   */
  static async getPopularGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    if (source === 'hybrid') {
      return this.fetchGamesHybrid('popular', limit);
    }
    return this.fetchGamesSmartly('popular', limit, source);
  }

  /**
   * Get paginated popular games for the all-games page
   */
  static async getPopularGamesPaginated(
    page: number = 1,
    limit: number = 20,
    source?: DataSource
  ): Promise<SearchResult> {
    const preferences = await this.getUserPreferences();
    let targetSource = source || preferences.preferredSource;
    
    // If source is 'auto', use IGDB for popular games as it has better popularity metrics
    if (targetSource === 'auto') {
      targetSource = 'igdb';
    }
    
    try {
      let games: Game[] = [];
      
      if (targetSource === 'igdb') {
        games = await IGDBService.getPopularGames(limit, page);
        
        return {
          games: games.map(game => ({
            ...game,
            source_id: game.id.replace('igdb_', ''),
            dataSource: 'igdb' as const
          })),
          total: 25000, // Reasonable estimate for total popular games
          page,
          pageSize: limit,
          hasNextPage: page < Math.ceil(25000 / limit),
          hasPreviousPage: page > 1,
          sources: ['igdb']
        };
      } else if (targetSource === 'rawg') {
        const result = await RAWGService.getPopularGames(page, limit);
        
        return {
          ...result,
          games: result?.games.map(game => ({
            ...game,
            id: `rawg_${game.id.replace('rawg_', '')}`,
            source_id: game.id.replace('rawg_', ''),
            dataSource: 'rawg' as const
          })) || [],
          sources: ['rawg']
        };
      }
      
      // Fallback to empty result
      return {
        games: [],
        total: 0,
        page,
        pageSize: limit,
        hasNextPage: false,
        hasPreviousPage: false,
        sources: []
      };
      
    } catch (error) {
      console.error('Paginated popular games fetch failed:', error);
      return {
        games: [],
        total: 0,
        page,
        pageSize: limit,
        hasNextPage: false,
        hasPreviousPage: false,
        sources: []
      };
    }
  }

  /**
   * Get trending games with smart source selection and optional hybrid merging
   */
  static async getTrendingGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    if (source === 'hybrid') {
      return this.fetchGamesHybrid('trending', limit);
    }
    return this.fetchGamesSmartly('trending', limit, source);
  }

  /**
   * Get upcoming games with smart source selection and optional hybrid merging
   */
  static async getUpcomingGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    if (source === 'hybrid') {
      return this.fetchGamesHybrid('upcoming', limit);
    }
    return this.fetchGamesSmartly('upcoming', limit, source);
  }

  /**
   * Get recent games with smart source selection and optional hybrid merging
   */
  static async getRecentGames(limit: number = 10, source?: DataSource): Promise<Game[]> {
    if (source === 'hybrid') {
      return this.fetchGamesHybrid('recent', limit);
    }
    return this.fetchGamesSmartly('recent', limit, source);
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

  /**
   * Get filtered games using IGDB's advanced filtering capabilities
   */
  static async getFilteredGames(filters: any): Promise<SearchResult> {
    try {
      // Use IGDB's getGames method which has comprehensive filtering support
      const result = await IGDBService.getGames(
        filters.page || 1,
        filters.limit || 24,
        {
          page: filters.page || 1,
          limit: filters.limit || 24,
          search: filters.search || '',
          sortBy: filters.sortBy || 'popularity',
          platformId: filters.platformId,
          genreId: filters.genreId,
          gameMode: filters.gameMode,
          theme: filters.theme,
          minRating: filters.minRating,
          maxRating: filters.maxRating,
          hasMultiplayer: filters.hasMultiplayer,
          releaseYear: filters.releaseYear,
          timeRange: filters.timeRange
        }
      );

      return {
        games: result.games as Game[],
        total: result.totalCount,
        page: result.currentPage,
        pageSize: result.games.length,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        sources: ['igdb']
      };
    } catch (error) {
      console.error('Filtered games request failed:', error);
      throw error;
    }
  }
} 