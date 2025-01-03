import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const challengeFilterSchema = z.object({
  type: z.enum(["competitive", "collaborative"]).optional(),
  status: z.enum(["upcoming", "active", "completed", "cancelled"]).optional(),
  participating: z.boolean().optional(),
  sortBy: z.enum(["created_at", "start_date", "participant_count"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  type: z.enum(["competitive", "collaborative"]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  min_participants: z.number().min(1),
  max_participants: z.number().nullable(),
  rules: z.array(z.string()).min(1).max(10),
  rewards: z.array(z.object({
    badge_id: z.string().uuid(),
    type: z.enum(["badge", "points", "title"]),
  })).min(1).max(5),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = challengeFilterSchema.parse({
      type: searchParams.get("type"),
      status: searchParams.get("status"),
      participating: searchParams.get("participating") === "true",
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });

    const supabase = createRouteHandlerClient({ cookies });
    
    let query = supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:profiles(id, username, avatar_url),
          progress,
          completed,
          joined_at
        ),
        rewards:challenge_rewards(
          id,
          badge_id,
          badge:badges(*)
        )
      `);

    // Apply filters
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.status) query = query.eq("status", filters.status);
    
    // Apply sorting
    if (filters.sortBy) {
      query = query.order(filters.sortBy, { 
        ascending: filters.sortOrder === "asc" 
      });
    }

    // Apply pagination
    query = query.range(
      filters.offset, 
      filters.offset + filters.limit - 1
    );

    const { data: challenges, error } = await query;

    if (error) throw error;

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Error in GET /api/challenges:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch challenges",
        details: error 
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

// POST handler with improved validation and error handling
async function postHandler(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw errors.unauthorized();
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createChallengeSchema.parse(body);

    // Create challenge using database function
    const { data: challenge, error: challengeError } = await supabase.rpc(
      'create_challenge',
      {
        challenge_data: {
          ...validatedData,
          creator_id: session.user.id,
          status: "upcoming",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    );

    if (challengeError) {
      throw new APIError('Failed to create challenge', 500, challengeError);
    }

    return responseHandler.created(challenge, 'Challenge created successfully');
  } catch (error) {
    const { error: message, statusCode, details } = errorHandler(error);
    return responseHandler.error(message, statusCode, details);
  }
}

// Apply rate limiting and validation
export async function POST(request: Request) {
  return withRateLimit(
    withValidation(createChallengeSchema, postHandler),
    {
      maxRequests: 20,
      windowMs: 60 * 1000
    }
  )(request);
}

// ... rest of the file remains the same 