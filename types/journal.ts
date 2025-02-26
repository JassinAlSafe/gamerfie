import { JournalGameData } from './game';

export type JournalEntryType = 'progress' | 'review' | 'daily' | 'list' | 'note' | 'achievement';

export interface JournalEntry {
  id: string;
  type: JournalEntryType;
  date: string;
  title: string;
  content: string;
  game?: JournalGameData;
  progress?: number;
  hoursPlayed?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  isLoading: boolean;
} 