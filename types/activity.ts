import type { Profile } from './profile';
import type { GameActivity } from './game';

// Enhanced Activity Enums - matches documentation specification
export type ActivityType = 
  | "game_added"
  | "game_status_updated"
  | "achievement_unlocked"
  | "game_completed"
  | "review_added"
  | "review_updated"
  | "friend_added"
  | "challenge_joined"
  | "challenge_completed"
  | "collection_created"
  | "game_session_completed"
  // Legacy types for backward compatibility
  | "want_to_play"
  | "started_playing"
  | "completed"
  | "achievement"
  | "review"
  | "progress";

export type ReactionType = 'like' | 'celebrate' | 'support';

// Enhanced metadata interface matching documentation
export interface ActivityMetadata {
  // Game-related metadata
  game_name?: string;
  game_cover_url?: string;
  previous_status?: string;
  new_status?: string;
  playtime_hours?: number;
  completion_percentage?: number;
  
  // Achievement metadata  
  achievement_name?: string;
  achievement_description?: string;
  achievement_rarity?: number;
  
  // Review metadata
  review_rating?: number;
  review_title?: string;
  
  // Friend metadata
  friend_username?: string;
  friend_avatar_url?: string;
  
  // Challenge metadata
  challenge_title?: string;
  challenge_progress?: number;
  
  // Collection metadata
  collection_name?: string;
  collection_games_count?: number;
  
  // Legacy support
  name?: string;
  comment?: string;
  achievement?: string;
  progress?: number;
  isBatched?: boolean;
  achievements?: Array<{ name: string }>;
  
  // Additional context
  platform?: string;
  notes?: string;
  [key: string]: any;
}

// Legacy alias
export interface ActivityDetails extends ActivityMetadata {}

export interface ActivityReaction {
  id: string;
  activity_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
}

// Legacy support
export interface LegacyActivityReaction {
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

// Enhanced Activity interface matching database schema
export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  game_id?: string;
  achievement_id?: string;
  review_id?: string;
  friend_id?: string;
  challenge_id?: string;
  collection_id?: string;
  metadata: ActivityMetadata;
  is_public: boolean;
  created_at: string;
  
  // Optional populated relationships
  game?: {
    name: string;
    coverImage: string | null;
  };
  user?: Pick<Profile, 'username' | 'avatar_url'>;
  
  // Legacy support
  details?: ActivityDetails;
}

// Legacy Activity interface for backward compatibility
export interface LegacyActivity {
  id: string;
  user_id: string;
  game_id: string;
  type: ActivityType;
  details?: ActivityDetails;
  created_at: string;
  game?: {
    name: string;
    coverImage: string | null;
  };
  user?: Pick<Profile, 'username' | 'avatar_url'>;
}

// Friend Activity interface (extends base Activity)
export interface FriendActivity {
  id: string;
  type: ActivityType;
  user_id: string;
  game_id: string;
  timestamp: string;
  created_at: string;
  details?: ActivityDetails;
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

// Game Activity interface (for game-specific activities)
export type { GameActivity };

// Response types
export interface ActivityFeed {
  activities: Activity[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ActivityFeedResponse {
  activities: EnhancedActivity[];
  has_more: boolean;
  next_cursor?: string;
  total_count?: number;
}

export interface GameActivityFeed {
  data: GameActivity[];
  hasMore: boolean;
}

// Enhanced activity with user and interaction data
export interface EnhancedActivity extends Activity {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  reactions_count: number;
  comments_count: number;
  user_reaction?: ReactionType;
  recent_comments?: Array<ActivityComment & {
    user: {
      username: string;
      avatar_url?: string;
    };
  }>;
}

// Activity creation data
export interface CreateActivityData {
  type: ActivityType;
  game_id?: string;
  achievement_id?: string;
  review_id?: string;
  friend_id?: string;
  challenge_id?: string;
  collection_id?: string;
  metadata?: ActivityMetadata;
  is_public?: boolean;
}

export interface ActivityFilters {
  types?: ActivityType[];
  userId?: string;
  gameId?: string;
  startDate?: string;
  endDate?: string;
  is_public?: boolean;
  user_id?: string;
  achievement_id?: string;
  review_id?: string;
  friend_id?: string;
  challenge_id?: string;
  collection_id?: string;
}

// Activity stats
export interface ActivityStats {
  total_activities: number;
  activities_by_type: Record<ActivityType, number>;
  most_active_day: {
    date: string;
    count: number;
  };
  recent_streak: {
    current: number;
    longest: number;
  };
} 