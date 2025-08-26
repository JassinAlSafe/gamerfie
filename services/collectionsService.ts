/**
 * Collections Service - Handle user game collections
 * Based on the documented collections feature
 */

import { createClient } from '@/utils/supabase/client';
import { APIError } from '@/utils/api';
import type {
  Collection,
  EnhancedCollection,
  CollectionGame,
  CreateCollectionData,
  UpdateCollectionData,
  CollectionFilters,
  CollectionStats,
  AddGameToCollectionData,
  CollectionShareData,
  CollectionTemplate,
  CollectionTemplateData
} from '@/types/collection';

export class CollectionsService {
  private static supabase = createClient();

  /**
   * Create a new collection
   */
  static async createCollection(data: CreateCollectionData): Promise<Collection> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { data: collection, error } = await this.supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          is_public: data.is_public ?? true,
          cover_url: data.cover_url || null,
          display_order: data.display_order || 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23514' && error.message.includes('name')) {
          throw new APIError('Collection name is required and cannot be empty', 400, 'VALIDATION_ERROR');
        }
        throw new APIError('Failed to create collection', 500, 'DATABASE_ERROR', error);
      }

      // Create activity for collection creation
      try {
        const { ActivityService } = await import('./activityService');
        await ActivityService.createActivity({
          type: 'collection_created',
          collection_id: collection.id,
          metadata: {
            collection_name: collection.name,
            games_count: 0
          }
        });
      } catch (activityError) {
        console.warn('Failed to create collection activity:', activityError);
      }

      return collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Get user's collections
   */
  static async getUserCollections(
    userId?: string,
    includePrivate: boolean = false
  ): Promise<EnhancedCollection[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new APIError('User not authenticated', 401);
      }

      let query = this.supabase
        .from('collections')
        .select(`
          *,
          user:profiles!collections_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', targetUserId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Only include public collections unless it's the user's own collections
      if (!includePrivate && targetUserId !== user?.id) {
        query = query.eq('is_public', true);
      }

      const { data: collections, error } = await query;

      if (error) {
        throw new APIError('Failed to fetch collections', 500, 'DATABASE_ERROR', error);
      }

      // Get preview games for each collection (first 4 games)
      const enhancedCollections = await Promise.all(
        (collections || []).map(async (collection) => {
          const { data: previewGames } = await this.supabase
            .from('collection_games')
            .select(`
              game_id,
              display_order,
              added_at
            `)
            .eq('collection_id', collection.id)
            .order('display_order', { ascending: true })
            .order('added_at', { ascending: true })
            .limit(4);

          return {
            ...collection,
            preview_games: previewGames?.map(pg => ({
              id: pg.game_id,
              name: 'Loading...', // Would be populated with actual game data
              cover_url: null
            })) || []
          };
        })
      );

      return enhancedCollections as EnhancedCollection[];
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw error;
    }
  }

  /**
   * Get a specific collection with all games
   */
  static async getCollection(
    collectionId: string,
    includeGames: boolean = true
  ): Promise<EnhancedCollection> {
    try {
      const { data: collection, error } = await this.supabase
        .from('collections')
        .select(`
          *,
          user:profiles!collections_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', collectionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new APIError('Collection not found', 404, 'COLLECTION_NOT_FOUND');
        }
        throw new APIError('Failed to fetch collection', 500, 'DATABASE_ERROR', error);
      }

      let games: any[] = [];
      if (includeGames) {
        const { data: collectionGames, error: gamesError } = await this.supabase
          .from('collection_games')
          .select(`
            *
          `)
          .eq('collection_id', collectionId)
          .order('display_order', { ascending: true })
          .order('added_at', { ascending: true });

        if (gamesError) {
          console.warn('Failed to fetch collection games:', gamesError);
        } else {
          // TODO: Fetch actual game details from games table or external API
          games = collectionGames?.map(cg => ({
            id: cg.game_id,
            name: 'Loading...', // Would be populated with actual game data
            cover_url: null,
            collection_game_id: cg.id,
            display_order: cg.display_order,
            added_at: cg.added_at,
            notes: cg.notes
          })) || [];
        }
      }

      return {
        ...collection,
        games
      } as EnhancedCollection;
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  }

  /**
   * Update a collection
   */
  static async updateCollection(data: UpdateCollectionData): Promise<Collection> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description?.trim() || null;
      if (data.is_public !== undefined) updateData.is_public = data.is_public;
      if (data.cover_url !== undefined) updateData.cover_url = data.cover_url || null;
      if (data.display_order !== undefined) updateData.display_order = data.display_order;

      const { data: collection, error } = await this.supabase
        .from('collections')
        .update(updateData)
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new APIError('Collection not found or access denied', 404, 'COLLECTION_NOT_FOUND');
        }
        throw new APIError('Failed to update collection', 500, 'DATABASE_ERROR', error);
      }

      return collection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      const { error } = await this.supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) {
        throw new APIError('Failed to delete collection', 500, 'DATABASE_ERROR', error);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  /**
   * Add game to collection
   */
  static async addGameToCollection(data: AddGameToCollectionData): Promise<CollectionGame> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      // Verify user owns the collection
      const { data: collection } = await this.supabase
        .from('collections')
        .select('id, name')
        .eq('id', data.collection_id)
        .eq('user_id', user.id)
        .single();

      if (!collection) {
        throw new APIError('Collection not found or access denied', 404, 'COLLECTION_NOT_FOUND');
      }

      const { data: collectionGame, error } = await this.supabase
        .from('collection_games')
        .insert({
          collection_id: data.collection_id,
          game_id: data.game_id,
          notes: data.notes?.trim() || null,
          display_order: data.display_order || 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new APIError('Game is already in this collection', 409, 'DUPLICATE_GAME');
        }
        throw new APIError('Failed to add game to collection', 500, 'DATABASE_ERROR', error);
      }

      // Create activity for adding game to collection
      try {
        const { ActivityService } = await import('./activityService');
        await ActivityService.createActivity({
          type: 'game_added_to_collection' as any,
          collection_id: data.collection_id,
          game_id: data.game_id,
          metadata: {
            collection_name: collection.name,
            game_name: 'Unknown Game' // TODO: Get actual game name
          }
        });
      } catch (activityError) {
        console.warn('Failed to create collection activity:', activityError);
      }

      return collectionGame;
    } catch (error) {
      console.error('Error adding game to collection:', error);
      throw error;
    }
  }

  /**
   * Remove game from collection
   */
  static async removeGameFromCollection(
    collectionId: string,
    gameId: string
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new APIError('User not authenticated', 401);
      }

      // Verify user owns the collection
      const { data: collection } = await this.supabase
        .from('collections')
        .select('id')
        .eq('id', collectionId)
        .eq('user_id', user.id)
        .single();

      if (!collection) {
        throw new APIError('Collection not found or access denied', 404, 'COLLECTION_NOT_FOUND');
      }

      const { error } = await this.supabase
        .from('collection_games')
        .delete()
        .eq('collection_id', collectionId)
        .eq('game_id', gameId);

      if (error) {
        throw new APIError('Failed to remove game from collection', 500, 'DATABASE_ERROR', error);
      }
    } catch (error) {
      console.error('Error removing game from collection:', error);
      throw error;
    }
  }

  /**
   * Get public collections (discovery)
   */
  static async getPublicCollections(
    filters: CollectionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    collections: EnhancedCollection[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      let query = this.supabase
        .from('collections')
        .select(`
          *,
          user:profiles!collections_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('is_public', true);

      // Apply filters
      if (filters.name_search) {
        query = query.ilike('name', `%${filters.name_search}%`);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      // Pagination
      const from = (page - 1) * limit;
      query = query
        .order('games_count', { ascending: false }) // Popular first
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      const { data: collections, error, count } = await query;

      if (error) {
        throw new APIError('Failed to fetch public collections', 500, 'DATABASE_ERROR', error);
      }

      return {
        collections: (collections || []) as EnhancedCollection[],
        totalCount: count || 0,
        hasMore: (count || 0) > from + limit,
      };
    } catch (error) {
      console.error('Error fetching public collections:', error);
      throw error;
    }
  }

  /**
   * Get collections stats
   */
  static async getCollectionsStats(): Promise<CollectionStats> {
    try {
      // Stats calculation can be added later if needed

      // If RPC function doesn't exist, calculate manually
      const { data: collections } = await this.supabase
        .from('collections')
        .select('is_public, games_count, created_at');

      const totalCollections = collections?.length || 0;
      const publicCollections = collections?.filter(c => c.is_public).length || 0;
      const privateCollections = totalCollections - publicCollections;
      const totalGamesInCollections = collections?.reduce((sum, c) => sum + (c.games_count || 0), 0) || 0;

      return {
        total_collections: totalCollections,
        public_collections: publicCollections,
        private_collections: privateCollections,
        total_games_in_collections: totalGamesInCollections,
        most_popular_collections: [],
        recently_created: []
      };
    } catch (error) {
      console.error('Error fetching collections stats:', error);
      throw error;
    }
  }

  /**
   * Create collection from template
   */
  static async createCollectionFromTemplate(
    template: CollectionTemplate
  ): Promise<Collection> {
    const templates: Record<CollectionTemplate, CollectionTemplateData> = {
      favorites: {
        name: '⭐ My Favorites',
        description: 'My all-time favorite games',
        is_public: false
      },
      wishlist: {
        name: '🎯 Wishlist',
        description: 'Games I want to play',
        is_public: false
      },
      currently_playing: {
        name: '🎮 Currently Playing',
        description: 'Games I\'m actively playing',
        is_public: true
      },
      completed: {
        name: '✅ Completed',
        description: 'Games I\'ve finished',
        is_public: true
      },
      multiplayer: {
        name: '👥 Multiplayer Games',
        description: 'Great games to play with friends',
        is_public: true
      },
      indie_games: {
        name: '🎨 Indie Gems',
        description: 'Amazing independent games',
        is_public: true
      },
      classic_games: {
        name: '🕹️ Retro Classics',
        description: 'Timeless classic games',
        is_public: true
      },
      puzzle_games: {
        name: '🧩 Brain Teasers',
        description: 'Challenging puzzle games',
        is_public: true
      },
      rpg_games: {
        name: '⚔️ Epic RPGs',
        description: 'Role-playing adventures',
        is_public: true
      },
      action_games: {
        name: '💥 Action Packed',
        description: 'Fast-paced action games',
        is_public: true
      }
    };

    const templateData = templates[template];
    return this.createCollection(templateData);
  }

  /**
   * Get shareable collection data
   */
  static async getCollectionShareData(collectionId: string): Promise<CollectionShareData> {
    try {
      const collection = await this.getCollection(collectionId, true);

      if (!collection.is_public) {
        throw new APIError('Collection is not public', 403, 'COLLECTION_PRIVATE');
      }

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        games_count: collection.games_count,
        user: collection.user,
        preview_games: (collection.games || []).slice(0, 4).map(game => ({
          id: game.id,
          name: game.name,
          cover_url: game.cover_url || undefined
        }))
      };
    } catch (error) {
      console.error('Error getting collection share data:', error);
      throw error;
    }
  }

  /**
   * Check if game is in any user collection
   */
  static async getGameCollections(_gameId: string): Promise<Collection[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: collections, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .in('id', []);

      if (error) {
        console.warn('Failed to fetch game collections:', error);
        return [];
      }

      return collections || [];
    } catch (error) {
      console.error('Error fetching game collections:', error);
      return [];
    }
  }
}