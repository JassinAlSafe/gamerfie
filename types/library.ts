import { Game } from './game';

export interface LibraryState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  updateGamesOrder: (games: Game[]) => void;
  fetchGames: () => Promise<void>;
  addGame: (game: Game) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
}
