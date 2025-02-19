import { JournalEntry } from "@/stores/useJournalStore";

export interface GameListItem {
  id: string;
  name: string;
  cover_url?: string;
  added_at?: string;
}

export interface GameList extends JournalEntry {
  type: "list";
  games: GameListItem[];
}

export interface GameListStore {
  lists: GameList[];
  currentList: GameList | null;
  isLoading: boolean;
  error: string | null;
  createList: (
    _title: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<GameList>;
  updateList: (
    listId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addGameToList: (
    listId: string,
    gameId: string,
    gameName: string,
    coverUrl: string
  ) => Promise<void>;
  removeGameFromList: (listId: string) => Promise<void>;
  fetchUserLists: () => Promise<void>;
  fetchListDetails: (listId: string) => Promise<void>;
  publicLists: GameList[];
  fetchPublicLists: () => Promise<void>;
  setListVisibility: (listId: string, isPublic: boolean) => Promise<void>;
}
