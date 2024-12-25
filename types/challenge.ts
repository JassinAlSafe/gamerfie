export type ChallengeType = "competitive" | "collaborative";

export type ChallengeStatus = "active" | "completed" | "upcoming";

export type ChallengeGoalType = "complete_games" | "play_time" | "review_games";

export interface ChallengeRequirements {
  genre?: string;
  platform?: string;
  minRating?: number;
  releaseYear?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  goal_type: ChallengeGoalType;
  goal_target: number;
  end_date: string;
  requirements?: ChallengeRequirements;
  participants: {
    user: {
      id: string;
      username: string;
      avatar_url?: string;
    };
    progress: number;
  }[];
} 