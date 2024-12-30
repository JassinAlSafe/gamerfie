export type ChallengeType = "competitive" | "collaborative";
export type ChallengeStatus = "upcoming" | "active" | "completed" | "cancelled";
export type TeamType = 'open' | 'invite_only' | 'auto_assign';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type RewardType = 'badge' | 'points' | 'title';
export type RewardDistribution = 'individual' | 'team' | 'top_performers';

export interface Requirements {
  minLevel?: number;
  maxLevel?: number;
  gameId?: string;
  platform?: string;
  genre?: string;
  achievementId?: string;
  playTime?: number;
  [key: string]: number | string | undefined;
}

export interface GameRequirements {
  minRating?: number;
  releaseYear?: number;
  platforms?: string[];
  genres?: string[];
  tags?: string[];
  [key: string]: number | string | string[] | undefined;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  email?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants: number | null;
  creator_id: string;
  created_at: string;
  creator?: UserProfile;
  goals?: ChallengeGoal[];
  participants?: ChallengeParticipant[];
  rewards?: ChallengeReward[];
  rules?: ChallengeRule[];
}

export interface ChallengeTeam {
  id: string;
  challenge_id: string;
  name: string;
  description?: string;
  team_type: TeamType;
  min_members: number;
  max_members?: number;
  created_at: string;
  participants?: ChallengeParticipant[];
  progress_history?: TeamProgressHistory[];
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  inviter?: UserProfile;
  invitee?: UserProfile;
}

export interface ChallengeParticipant {
  challenge_id: string;
  user_id: string;
  team_id?: string;
  joined_at: string;
  user?: UserProfile;
}

export interface ProgressMilestone {
  id: string;
  challenge_id: string;
  title: string;
  description?: string;
  required_progress: number;
  reward_type?: RewardType;
  reward_amount?: number;
  created_at: string;
  achievements?: ParticipantAchievement[];
}

export interface ParticipantAchievement {
  id: string;
  participant_id: string;
  milestone_id: string;
  achieved_at: string;
  milestone?: ProgressMilestone;
}

export interface TeamProgressHistory {
  id: string;
  team_id: string;
  progress: number;
  recorded_at: string;
}

// Request/Response types
export interface CreateTeamRequest {
  name: string;
  description?: string;
  team_type: TeamType;
  max_members?: number;
}

export interface UpdateTeamRequest {
  team_id: string;
  name?: string;
  description?: string;
  team_type?: TeamType;
  max_members?: number;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  required_progress: number;
  reward_type?: RewardType;
  reward_amount?: number;
}

export interface UpdateMilestoneRequest {
  milestone_id: string;
  title?: string;
  description?: string;
  required_progress?: number;
  reward_type?: RewardType;
  reward_amount?: number;
}

export interface UpdateProgressRequest {
  progress: number;
}

export interface CreateInvitationRequest {
  invitee_id: string;
}

export interface UpdateInvitationRequest {
  status: 'accepted' | 'rejected';
}

// Response types
export interface ChallengeProgressResponse {
  participants: (ChallengeParticipant & {
    achievements: (ParticipantAchievement & {
      milestone: ProgressMilestone;
    })[];
  })[];
  milestones: ProgressMilestone[];
}

export interface ChallengeGoal {
  id: string;
  challenge_id: string;
  type: string;
  target: number;
  description?: string;
  created_at: string;
}

export interface ChallengeReward {
  id: string;
  challenge_id: string;
  type: "badge" | "points" | "title";
  name: string;
  description: string;
  created_at: string;
}

export interface ChallengeRule {
  id: string;
  challenge_id: string;
  rule: string;
  created_at: string;
} 