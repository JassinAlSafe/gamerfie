import { Game } from './game';

export interface GameList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  games: GameListItem[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameListItem {
  gameId: string;
  game: Game;
  addedAt: string;
  notes?: string;
  order: number;
}

export interface CreateGameListDTO {
  title: string;
  description?: string;
  isPublic?: boolean;
  games?: string[]; // Array of game IDs
}

export interface UpdateGameListDTO {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddGameToListDTO {
  gameId: string;
  notes?: string;
} 