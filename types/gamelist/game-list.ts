export interface GameListItem {
  id: string;
  name: string;
  cover_url?: string | null;
  added_at: string;
}

export interface GameListUser {
  username: string;
  avatar_url: string | null;
}

export interface GameList {
  id: string;
  type: 'list';
  title: string;
  content: string | null;
  games: GameListItem[];
  date: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  user_id: string;
  user?: GameListUser;
  game?: JournalGameData;
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
}

export interface JournalGameData {
  id: string;
  name: string;
  cover_url?: string;
}

export interface GameListResponse {
  lists: GameList[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GameListStore {
  lists: GameList[];
  currentList: GameList | null;
  publicLists: GameList[];
  isLoading: boolean;
  error: string | null;

  // List Management
  createList: (title: string, description?: string, isPublic?: boolean) => Promise<GameList>;
  updateList: (listId: string, title: string, description?: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  setListVisibility: (listId: string, isPublic: boolean) => Promise<void>;

  // Game Management
  addGameToList: (listId: string, gameId: string, gameName: string, coverUrl: string) => Promise<void>;
  removeGameFromList: (listId: string, gameId: string) => Promise<void>;

  // Fetching
  fetchUserLists: () => Promise<void>;
  fetchListDetails: (listId: string) => Promise<void>;
  fetchPublicLists: () => Promise<void>;
}