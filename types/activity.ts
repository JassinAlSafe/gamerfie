export type ActivityType = 
  | "want_to_play"
  | "started_playing"
  | "completed"
  | "reviewed"
  | "liked"
  | "disliked";

export interface Activity {
  id: string;
  user_id: string;
  game_id: string;
  type: ActivityType;
  details?: string;
  created_at: string;
  game?: {
    name: string;
    cover_url?: string;
  };
  user?: {
    username: string;
    avatar_url?: string;
  };
} 