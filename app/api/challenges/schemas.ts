import { z } from "zod";

// Challenge goal schema
export const challengeGoalSchema = z.object({
  type: z.enum(["play_time", "complete_games", "achieve_trophies", "review_games", "score_points", "reach_level"]),
  target: z.number().positive(),
  description: z.string().optional()
});

// Challenge reward schema
export const challengeRewardSchema = z.object({
  type: z.enum(["badge", "points", "title"]),
  name: z.string().min(1),
  description: z.string().min(1),
  badge_id: z.string().uuid().optional()
});

// Base challenge schema
const baseChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  type: z.enum(["competitive", "collaborative"]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  min_participants: z.number().positive().optional(),
  max_participants: z.number().positive().optional(),
  goals: z.array(challengeGoalSchema).min(1),
  rewards: z.array(challengeRewardSchema).optional(),
  rules: z.array(z.string()).optional(),
  cover_url: z.string().url().optional()
});

// Challenge creation schema
export const createChallengeSchema = baseChallengeSchema.refine(data => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: "End date must be after start date"
}).refine(data => {
  if (data.min_participants && data.max_participants) {
    return data.max_participants >= data.min_participants;
  }
  return true;
}, {
  message: "Maximum participants must be greater than or equal to minimum participants"
});

// Challenge update schema
export const updateChallengeSchema = baseChallengeSchema
  .partial()
  .omit({ type: true }); 