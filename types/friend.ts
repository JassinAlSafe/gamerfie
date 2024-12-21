export type FriendStatus = 'pending' | 'accepted' | 'declined';

export interface Friend {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  status: FriendStatus;
  sender_id: string;
  avatar_url?: string;
}

export interface FriendCardProps {
  friend: Friend;
  onStatusUpdate: (friendId: string, status: FriendStatus) => void;
  onRemove: (friendId: string) => void;
}

export interface FriendRequest {
  friendId: string;
}

export interface FriendsFilter {
  status?: FriendStatus | 'all';
}

export interface ActivityDetails {
  name?: string;
  comment?: string;
  achievement?: string;
  progress?: number;
}

export type ActivityType = 
  | "started_playing" 
  | "completed" 
  | "achievement" 
  | "review" 
  | "want_to_play"
  | "progress";

export interface ActivityReaction {
  id: string;
  activity_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

export interface FriendActivity {
  id: string;
  type: ActivityType;
  user_id: string;
  game_id: string;
  timestamp: string;
  created_at: string;
  details?: {
    name?: string;
    comment?: string;
  };
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  game: {
    id: string;
    name: string;
    cover_url: string | null;
  };
  reactions?: ActivityReaction[];
  comments?: ActivityComment[];
}

export interface FriendsState {
  friends: Friend[];
  isLoading: boolean;
  error: string | null;
  filter: FriendStatus | 'all';
  setFilter: (_filter: FriendStatus | 'all') => void;
  fetchFriends: () => Promise<void>;
  addFriend: (_request: FriendRequest) => Promise<void>;
  removeFriend: (_friendId: string) => Promise<void>;
  updateFriendStatus: (_friendId: string, _status: FriendStatus) => Promise<void>;
  activities: FriendActivity[];
  isLoadingActivities: boolean;
  activitiesPage: number;
  fetchActivities: () => Promise<void>;
  loadMoreActivities: () => Promise<void>;
  getGameActivities: (gameId: string, page?: number) => Promise<FriendActivity[]>;
  createActivity: (activity_type: ActivityType, game_id?: string, details?: ActivityDetails) => Promise<void>;
  addReaction: (activityId: string, emoji: string) => Promise<void>;
  removeReaction: (activityId: string, emoji: string) => Promise<void>;
  addComment: (activityId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
} 