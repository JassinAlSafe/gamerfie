import type { Game } from './game';
import type { Profile } from './profile';

// Activity Enums
export type ActivityType = 
  | "want_to_play"
  | "started_playing"
  | "completed"
  | "reviewed"
  | "liked"
  | "disliked"
  | "game_status_updated"
  | "achievement_unlocked"
  | "game_completed"
  | "review_added";

// Activity interfaces
export interface Activity {
  id: string;
  user_id: string;
  game_id: string;
  type: ActivityType;
  details?: string;
  created_at: string;
  game?: Pick<Game, 'name' | 'coverImage'>;
  user?: Pick<Profile, 'username' | 'avatar_url'>;
}

export interface GameActivity {
  id: string;
  type: ActivityType;
  metadata: {
    status?: string;
    achievement?: {
      name: string;
      icon_url?: string;
    };
    rating?: number;
    review?: string;
    playtime?: number;
  };
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  reactions?: {
    count: number;
    user_has_reacted: boolean;
  };
  comments?: {
    count: number;
  };
}

// Activity Response types
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