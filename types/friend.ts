export type FriendStatus = 'pending' | 'accepted';

export interface Friend {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  status: FriendStatus;
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

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'started_playing' | 'completed' | 'achievement' | 'review';
  game_id: string;
  details?: {
    name?: string;
    comment?: string;
  };
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  game: {
    id: string;
    name: string;
    cover_url?: string;
  };
}

export type ActivityType = 'started_playing' | 'completed' | 'achievement' | 'review';

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
} 