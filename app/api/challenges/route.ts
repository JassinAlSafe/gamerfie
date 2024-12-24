import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for the API request
const createChallengeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["competitive", "collaborative"]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  goal_type: z.enum(["complete_games", "achieve_trophies", "play_time", "review_games", "score_points"]),
  goal_target: z.number().positive(),
  max_participants: z.number().positive().optional(),
  rewards: z.array(
    z.object({
      type: z.enum(["badge", "points", "title"]),
      name: z.string().min(1),
      description: z.string().min(1),
    })
  ),
  rules: z.array(
    z.union([
      z.string(),
      z.object({
        rule: z.string().min(1),
      }),
    ])
  ),
});

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch challenges:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("Authentication error: No session found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse and validate request data
    let json;
    try {
      json = await request.json();
      console.log("Raw request data:", json);
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON data" },
        { status: 400 }
      );
    }

    // Format dates
    const formattedData = {
      ...json,
      start_date: json.start_date instanceof Date ? json.start_date.toISOString() : json.start_date,
      end_date: json.end_date instanceof Date ? json.end_date.toISOString() : json.end_date,
    };

    console.log("Formatted data:", formattedData);

    // Validate data against schema
    const result = createChallengeSchema.safeParse(formattedData);

    if (!result.success) {
      console.error("Validation errors:", JSON.stringify(result.error.errors, null, 2));
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: result.error.errors
        },
        { status: 400 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData) {
      console.error("User profile error:", userError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Create challenge
    const challengeData = {
      title: result.data.title,
      description: result.data.description,
      type: result.data.type,
      status: "upcoming",
      start_date: result.data.start_date,
      end_date: result.data.end_date,
      goal_type: result.data.goal_type,
      goal_target: result.data.goal_target,
      min_participants: 2,
      max_participants: result.data.max_participants || null,
      game_id: null,
      creator_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Creating challenge with data:", challengeData);

    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert(challengeData)
      .select()
      .single();

    if (challengeError) {
      console.error("Challenge creation error:", challengeError);
      return NextResponse.json(
        { error: "Failed to create challenge", details: challengeError },
        { status: 500 }
      );
    }

    console.log("Created challenge:", challenge);

    // Insert rewards
    if (result.data.rewards.length > 0) {
      const rewardsData = result.data.rewards.map((reward) => ({
        challenge_id: challenge.id,
        type: reward.type,
        name: reward.name,
        description: reward.description,
        created_at: new Date().toISOString()
      }));

      console.log("Creating rewards:", rewardsData);

      const { error: rewardsError } = await supabase
        .from("challenge_rewards")
        .insert(rewardsData);

      if (rewardsError) {
        console.error("Rewards creation error:", rewardsError);
        return NextResponse.json(
          { error: "Failed to create rewards", details: rewardsError },
          { status: 500 }
        );
      }
    }

    // Insert rules
    if (result.data.rules.length > 0) {
      const rulesData = result.data.rules.map((rule) => ({
        challenge_id: challenge.id,
        rule: typeof rule === 'string' ? rule : rule.rule,
        created_at: new Date().toISOString()
      }));

      console.log("Creating rules:", rulesData);

      const { error: rulesError } = await supabase
        .from("challenge_rules")
        .insert(rulesData);

      if (rulesError) {
        console.error("Rules creation error:", rulesError);
        return NextResponse.json(
          { error: "Failed to create rules", details: rulesError },
          { status: 500 }
        );
      }
    }

    // Add creator as participant
    const participantData = {
      challenge_id: challenge.id,
      user_id: session.user.id,
      progress: 0,
      completed: false,
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Adding creator as participant:", participantData);

    const { error: participantError } = await supabase
      .from("challenge_participants")
      .insert(participantData);

    if (participantError) {
      console.error("Participant creation error:", participantError);
      return NextResponse.json(
        { error: "Failed to add creator as participant", details: participantError },
        { status: 500 }
      );
    }

    const response = {
      message: "Challenge created successfully",
      challenge: {
        ...challenge,
        creator: {
          id: session.user.id,
          username: userData.username,
          avatar_url: userData.avatar_url,
        },
        participants: [{
          user: {
            id: session.user.id,
            username: userData.username,
            avatar_url: userData.avatar_url,
          },
          joined_at: new Date().toISOString(),
          progress: 0,
          completed: false,
        }],
        rewards: result.data.rewards,
        rules: result.data.rules,
      }
    };

    console.log("Sending response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("Unhandled error in challenge creation:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 