import { z } from "zod";

// Base types
export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

export interface ChallengeGoal {
  id: string;
  challenge_id: string;
  type: ChallengeGoalType;
  target: number;
  description?: string;
  created_at: string;
}

export type ChallengeGoalType =
  | "complete_games"
  | "achieve_trophies"
  | "play_time"
  | "review_games"
  | "score_points"
  | "reach_level";

export interface ChallengeTeam {
  id: string;
  challenge_id: string;
  name: string;
  progress: number;
  participants: ChallengeParticipant[];
  created_at: string;
}

export interface ChallengeParticipant {
  user: Profile;
  joined_at: string;
  team_id?: string;
}

export interface ChallengeReward {
  type: "badge" | "points" | "title";
  name: string;
  description: string;
}

export interface ChallengeRule {
  rule: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  status: "upcoming" | "active" | "completed";
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants?: number;
  creator: Profile;
  goals: ChallengeGoal[];
  teams: ChallengeTeam[];
  rewards: ChallengeReward[];
  rules: ChallengeRule[];
  created_at: string;
  updated_at: string;
}

export interface UserChallenge extends Challenge {
  user_progress: number;
  user_team?: string;
}

// Request/Response types
export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  start_date: string;
  end_date: string;
  goals: Array<{
    type: ChallengeGoalType;
    target: number;
    description?: string;
  }>;
  max_participants?: number;
  rewards: ChallengeReward[];
  rules: Array<string | { rule: string }>;
}

export interface UpdateChallengeRequest {
  title?: string;
  description?: string;
  type?: "competitive" | "collaborative";
  start_date?: string;
  end_date?: string;
  max_participants?: number;
}

export interface CreateTeamRequest {
  name: string;
}

export interface UpdateTeamRequest {
  teamId?: string;
  action: "join" | "leave";
}

export interface UpdateGoalProgressRequest {
  goalId: string;
  progress: number;
}

// Zod schemas for validation
const titleSchema = z.string()
  .min(3, "Title must be at least 3 characters long")
  .max(100, "Title must be at most 100 characters long")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Title can only contain letters, numbers, spaces, hyphens, and underscores");

const descriptionSchema = z.string()
  .min(10, "Description must be at least 10 characters long")
  .max(1000, "Description must be at most 1000 characters long");

const dateSchema = z.string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), "Date must be in the future");

const goalSchema = z.object({
  type: z.enum([
    "complete_games",
    "achieve_trophies",
    "play_time",
    "review_games",
    "score_points",
    "reach_level",
  ]),
  target: z.number()
    .positive("Target must be a positive number")
    .max(1000000, "Target must be at most 1,000,000"),
  description: z.string()
    .min(5, "Goal description must be at least 5 characters long")
    .max(200, "Goal description must be at most 200 characters long")
    .optional(),
});

const rewardSchema = z.object({
  type: z.enum(["badge", "points", "title"]),
  name: z.string()
    .min(3, "Reward name must be at least 3 characters long")
    .max(50, "Reward name must be at most 50 characters long"),
  description: z.string()
    .min(10, "Reward description must be at least 10 characters long")
    .max(200, "Reward description must be at most 200 characters long"),
});

const ruleSchema = z.union([
  z.string()
    .min(5, "Rule must be at least 5 characters long")
    .max(200, "Rule must be at most 200 characters long"),
  z.object({
    rule: z.string()
      .min(5, "Rule must be at least 5 characters long")
      .max(200, "Rule must be at most 200 characters long"),
  }),
]);

export const createChallengeSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  type: z.enum(["competitive", "collaborative"]),
  start_date: dateSchema,
  end_date: dateSchema.refine(
    (date) => {
      try {
        const endDate = new Date(date);
        return !isNaN(endDate.getTime());
      } catch {
        return false;
      }
    },
    "End date must be a valid date"
  ),
  goals: z.array(goalSchema)
    .min(1, "At least one goal is required")
    .max(5, "Maximum of 5 goals allowed"),
  max_participants: z.number()
    .positive("Maximum participants must be a positive number")
    .max(100, "Maximum of 100 participants allowed")
    .optional(),
  rewards: z.array(rewardSchema)
    .min(1, "At least one reward is required")
    .max(5, "Maximum of 5 rewards allowed"),
  rules: z.array(ruleSchema)
    .min(1, "At least one rule is required")
    .max(10, "Maximum of 10 rules allowed"),
}).refine(
  (data) => {
    if (data.type === "competitive" && !data.max_participants) {
      return false;
    }
    return true;
  },
  {
    message: "Competitive challenges must have a maximum number of participants",
    path: ["max_participants"],
  }
).refine(
  (data) => {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

export const updateChallengeSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  type: z.enum(["competitive", "collaborative"]).optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  max_participants: z.number()
    .positive("Maximum participants must be a positive number")
    .max(100, "Maximum of 100 participants allowed")
    .optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

export const createTeamSchema = z.object({
  name: z.string()
    .min(3, "Team name must be at least 3 characters long")
    .max(50, "Team name must be at most 50 characters long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Team name can only contain letters, numbers, spaces, hyphens, and underscores"),
});

export const updateTeamSchema = z.object({
  teamId: z.string()
    .uuid("Invalid team ID")
    .optional(),
  action: z.enum(["join", "leave"]),
}).refine(
  (data) => {
    if (data.action === "join" && !data.teamId) {
      return false;
    }
    return true;
  },
  {
    message: "Team ID is required when joining a team",
    path: ["teamId"],
  }
);

export const updateGoalProgressSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID"),
  progress: z.number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must be at most 100"),
}); 