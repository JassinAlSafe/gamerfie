import { z } from "zod";
import { NextResponse } from "next/server";

// Challenge creation schema
export const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  type: z.enum(["competitive", "collaborative"]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  goals: z.array(z.object({
    type: z.enum(["play_time", "complete_games", "achieve_trophies"]),
    target: z.number().positive(),
    description: z.string().optional()
  })).min(1),
  max_participants: z.number().positive().optional(),
  rewards: z.array(z.object({
    type: z.enum(["badge", "points", "title"]),
    name: z.string(),
    description: z.string()
  }))
}).refine(data => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: "End date must be after start date"
});

export const withValidation = (schema: z.Schema, handler: Function) => {
  return async (request: Request, ...args: any[]) => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { 
            error: "Validation failed",
            details: result.error.errors 
          },
          { status: 400 }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
  };
}; 