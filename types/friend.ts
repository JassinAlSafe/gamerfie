export type FriendStatus = 'pending' | 'accepted' | 'declined';
export type OnlineStatus = 'online' | 'offline';

export interface Friend {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  status: FriendStatus;
  online_status?: OnlineStatus;
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
  achievement_name?: string;
  achievement_description?: string;
  rating?: number;
  review_content?: string;
  progress?: number;
}

export type ActivityType = 'started_playing' | 'completed_game' | 'earned_achievement' | 'reviewed_game';

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

export interface FriendActivityUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface FriendActivityGame {
  id: string;
  name: string;
  cover_url: string | null;
}

export interface FriendActivity {
  id: string;
  type: ActivityType;
  user_id: string;
  game_id: string;
  created_at: string;
  details?: ActivityDetails;
  user: FriendActivityUser;
  game: FriendActivityGame;
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

export interface RequestBody {
  activity_type: ActivityType;
  game_id: string;
  details?: Record<string, unknown>;
}

export interface FriendActivityRecord {
  id: string;
  activity_type: ActivityType;
  user_id: string;
  game_id: string;
  created_at: string;
  details: Record<string, unknown>;
}

export interface ProfileRecord {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface GameRecord {
  id: string;
  name: string;
  cover_url: string | null;
} 