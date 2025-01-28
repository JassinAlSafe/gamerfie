import type { ActivityType, ActivityDetails, FriendActivity } from './activity';

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

export interface SupabaseFriendData {
  id: string;
  username: string;
  avatar_url: string | null;
  online_status?: OnlineStatus;
}

export interface SupabaseFriendRecord {
  id: string;
  status: FriendStatus;
  user_id: string;
  friend_id: string;
  friend_profile: SupabaseFriendData;
}