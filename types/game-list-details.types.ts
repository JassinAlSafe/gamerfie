import type { GameList, GameListItem } from "@/types/gamelist/game-list";

export interface ListComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export interface GameListDetailsProps {
  listId: string;
}

export interface GameListDetailsState {
  comments: ListComment[];
  newComment: string;
  isSubmitting: boolean;
  isLiked: boolean;
  likeCount: number;
}

export interface ListHeaderProps {
  list: GameList;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onShare: () => void;
}

export interface GamesGridProps {
  games: GameListItem[];
  searchTerm?: string;
  sortBy?: string;
}

export interface GameCardProps {
  game: GameListItem;
  index?: number;
}

export interface CommentsSection {
  comments: ListComment[];
  newComment: string;
  isSubmitting: boolean;
  profile: any;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  onAuthPrompt: () => void;
}

export interface EmptyStateProps {
  variant: 'games' | 'comments';
}

export interface SkeletonProps {
  variant?: 'default' | 'compact';
}

export interface CommentItemProps {
  comment: ListComment;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface GameStats {
  total: number;
  hasGames: boolean;
  isEmpty: boolean;
}

export interface ToastOptions {
  title: string;
  description?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type CommentError = {
  type: 'fetch' | 'submit' | 'validation';
  message: string;
};