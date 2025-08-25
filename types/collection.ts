/**
 * Collection System Types
 * Based on the documented collection feature specifications
 */

export type UUID = string;
export type ISO8601DateTime = string;

import { Game } from "./game";

export interface Collection {
  id: UUID;
  user_id: UUID;
  name: string;
  description?: string;
  is_public: boolean;
  cover_url?: string;
  display_order: number;
  games_count: number;
  created_at: ISO8601DateTime;
  updated_at: ISO8601DateTime;
}

export interface CollectionGame {
  id: UUID;
  collection_id: UUID;
  game_id: string;
  display_order: number;
  added_at: ISO8601DateTime;
  notes?: string;
}

// Enhanced collection with user and games data
export interface EnhancedCollection extends Collection {
  user: {
    id: UUID;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  games?: Array<Game & {
    collection_game_id: UUID;
    display_order: number;
    added_at: ISO8601DateTime;
    notes?: string;
  }>;
  preview_games?: Game[]; // First few games for previews
}

// Collection creation/update data
export interface CreateCollectionData {
  name: string;
  description?: string;
  is_public?: boolean;
  cover_url?: string;
  display_order?: number;
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {
  id: UUID;
}

// Collection filters
export interface CollectionFilters {
  user_id?: UUID;
  is_public?: boolean;
  name_search?: string;
  has_game?: string;
  created_after?: ISO8601DateTime;
  created_before?: ISO8601DateTime;
}

// Collection stats
export interface CollectionStats {
  total_collections: number;
  public_collections: number;
  private_collections: number;
  total_games_in_collections: number;
  most_popular_collections: Array<{
    id: UUID;
    name: string;
    games_count: number;
    user: {
      username: string;
      avatar_url?: string;
    };
  }>;
  recently_created: Array<{
    id: UUID;
    name: string;
    created_at: ISO8601DateTime;
  }>;
}

// Add game to collection data
export interface AddGameToCollectionData {
  collection_id: UUID;
  game_id: string;
  notes?: string;
  display_order?: number;
}

// Collection sharing data
export interface CollectionShareData {
  id: UUID;
  name: string;
  description?: string;
  games_count: number;
  user: {
    username: string;
    avatar_url?: string;
  };
  preview_games: Array<{
    id: string;
    name: string;
    cover_url?: string;
  }>;
}

// Collection template types for common collections
export type CollectionTemplate = 
  | 'favorites'
  | 'wishlist'
  | 'currently_playing'
  | 'completed'
  | 'multiplayer'
  | 'indie_games'
  | 'classic_games'
  | 'puzzle_games'
  | 'rpg_games'
  | 'action_games';

export interface CollectionTemplateData {
  name: string;
  description: string;
  is_public: boolean;
  cover_url?: string;
}

// Collection activity for activity feed
export interface CollectionActivity {
  type: 'collection_created' | 'collection_updated' | 'game_added_to_collection';
  collection_id: UUID;
  game_id?: string;
  metadata: {
    collection_name: string;
    game_name?: string;
    games_count?: number;
  };
}