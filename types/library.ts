import { Game } from './game';

export interface LibraryState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  updateGamesOrder: (games: Game[]) => void;
  fetchUserLibrary: (userId: string) => Promise<void>;
  addGameToLibrary: (game: Game, userId: string) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
}
