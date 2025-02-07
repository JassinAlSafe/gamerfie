import type { Game } from './game';
import type { Profile } from './profile';
import type { GameActivity } from './game';

// Activity Enums
export type ActivityType = 
  | "want_to_play"
  | "started_playing"
  | "completed"
  | "achievement"
  | "review"
  | "progress"
  | "game_status_updated"
  | "achievement_unlocked"
  | "game_completed"
  | "review_added";

export interface ActivityDetails {
  name?: string;
  comment?: string;
  achievement?: string;
  progress?: number;
  isBatched?: boolean;
  achievements?: Array<{ name: string }>;
}

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

// Base Activity interface
export interface Activity {
  id: string;
  user_id: string;
  game_id: string;
  type: ActivityType;
  details?: ActivityDetails;
  created_at: string;
  game?: Pick<Game, 'name' | 'coverImage'>;
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

export interface GameActivityFeed {
  data: GameActivity[];
  hasMore: boolean;
}

export interface ActivityFilters {
  types?: ActivityType[];
  userId?: string;
  gameId?: string;
  startDate?: string;
  endDate?: string;
} 