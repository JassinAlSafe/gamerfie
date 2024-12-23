export type ChallengeType = 'collaborative' | 'competitive';

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export type ChallengeGoalType = 
  | 'complete_games' 
  | 'achieve_trophies' 
  | 'play_time' 
  | 'review_games'
  | 'score_points';

export type RewardType = 'badge' | 'points' | 'title';

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface ChallengeParticipant {
  user: User;
  joined_at: string;
  progress: number;
  completed: boolean;
}

export interface ChallengeReward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
}

export interface ChallengeRule {
  id: string;
  rule: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  start_date: string;
  end_date: string;
  goal_type: ChallengeGoalType;
  goal_target: number;
  min_participants: number | null;
  max_participants: number | null;
  creator: User;
  participants: ChallengeParticipant[];
  rewards: ChallengeReward[];
  rules: ChallengeRule[];
  created_at: string;
  updated_at: string;
}

export interface ClaimedReward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  challenge_id: string;
  challenge_title: string;
  claimed_at: string;
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
  rewards: Omit<ChallengeReward, 'id' | 'image_url'>[];
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

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string;
  progress: number;
  completed: boolean;
}

export interface ChallengeLeaderboard {
  challenge_id: string;
  rankings: LeaderboardEntry[];
} 