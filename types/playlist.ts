import { Game } from "./game";

export type PlaylistType = 'featured' | 'collection' | 'event' | 'genre' | 'custom';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  type: PlaylistType;
  slug: string;
  isPublished: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  gameIds: string[];
  games?: Game[];
  order?: number;
  metadata?: {
    backgroundColor?: string;
    textColor?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface PlaylistGame {
  playlistId: string;
  gameId: string;
  order: number;
  addedAt: string;
}

export interface CreatePlaylistInput {
  title: string;
  description: string;
  type: PlaylistType;
  coverImage?: string;
  isPublished?: boolean;
  startDate?: string;
  endDate?: string;
  gameIds?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePlaylistInput extends Partial<CreatePlaylistInput> {
  id: string;
} 