export type ChallengeType = 'collaborative' | 'competitive';

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export type ChallengeGoalType = 
  | 'complete_games' 
  | 'achieve_trophies' 
  | 'play_time' 
  | 'review_games'
  | 'score_points';

export interface ChallengeGoal {
  type: ChallengeGoalType;
  target: number;
  current?: number;
}

export interface ChallengeReward {
  type: 'badge' | 'points' | 'title';
  name: string;
  description: string;
  image_url?: string;
}

export interface ChallengeParticipant {
  user_id: string;
  username: string;
  avatar_url?: string;
  joined_at: string;
  progress: number;
  rank?: number;
  completed: boolean;
}

export interface ChallengeRule {
  id: string;
  rule: string;
  created_at: string;
  challenge_id: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  creator_id: string;
  created_at: string;
  start_date: string;
  end_date: string;
  goal: ChallengeGoal;
  rewards: ChallengeReward[];
  participants: ChallengeParticipant[];
  min_participants?: number;
  max_participants?: number;
  total_progress?: number; // For collaborative challenges
  rules: ChallengeRule[];
  game_id?: string; // Optional: If challenge is specific to a game
  tags?: string[];
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  type: ChallengeType;
  start_date: string;
  end_date: string;
  goal: {
    type: ChallengeGoalType;
    target: number;
  };
  rewards: Omit<ChallengeReward, 'image_url'>[];
  min_participants?: number;
  max_participants?: number;
  rules?: string[];
  game_id?: string;
  tags?: string[];
}

export interface UpdateChallengeInput {
  title?: string;
  description?: string;
  status?: ChallengeStatus;
  start_date?: string;
  end_date?: string;
  goal?: {
    type: ChallengeGoalType;
    target: number;
  };
  rewards?: ChallengeReward[];
  min_participants?: number;
  max_participants?: number;
  rules?: string[];
  tags?: string[];
}

export interface ChallengeProgress {
  challenge_id: string;
  user_id: string;
  progress: number;
  last_updated: string;
  completed: boolean;
  milestones_reached?: string[];
}

export interface ChallengeLeaderboard {
  challenge_id: string;
  rankings: {
    rank: number;
    user_id: string;
    username: string;
    avatar_url?: string;
    progress: number;
    completed: boolean;
  }[];
} 