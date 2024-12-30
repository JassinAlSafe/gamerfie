import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "date";

    console.log("GET /api/challenges - Query params:", { type, status, sort });

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // First, let's check what relationships exist
    const { data: relationships, error: relError } = await supabase.rpc(
      'get_relationships'
    );

    if (relError) {
      console.error("Error checking relationships:", relError);
    } else {
      console.log("Available relationships:", relationships);
    }

    // Build query in steps to isolate any issues
    // 1. First get basic challenge data
    let query = supabase.from("challenges").select(`
      *,
      creator:profiles (
        id,
        username,
        avatar_url
      ),
      goals:challenge_goals!fk_challenge_goals_challenge (
        id,
        type,
        target,
        description
      ),
      participants:challenge_participants!fk_challenge_participants_challenge (
        user_id,
        joined_at,
        user:profiles (
          id,
          username,
          avatar_url
        )
      ),
      rewards:challenge_rewards!fk_challenge_rewards_challenge (
        id,
        type,
        name,
        description
      ),
      rules:challenge_rules!fk_challenge_rules_challenge (
        id,
        rule
      )
    `);

    // Apply filters
    if (type && type !== "all") {
      console.log("Applying type filter:", type);
      query = query.eq("type", type);
    }

    if (status && status !== "all") {
      console.log("Applying status filter:", status);
      query = query.eq("status", status);
    }

    // Apply sorting
    if (sort === "date") {
      console.log("Applying date sort");
      query = query.order("created_at", { ascending: false });
    } else if (sort === "participants") {
      console.log("Applying participants sort");
      query = query.order("min_participants", { ascending: true });
    }

    const { data: challenges, error: challengesError } = await query;

    if (challengesError) {
      console.error("Challenges fetch error:", challengesError);
      return NextResponse.json(
        { error: "Failed to fetch challenges", details: challengesError },
        { status: 500 }
      );
    }

    // If we got challenges but creator info is missing, fetch it separately
    if (challenges && challenges.length > 0 && !challenges[0].creator) {
      console.log("Creator info missing, fetching separately");
      const creatorIds = [...new Set(challenges.map(c => c.creator_id))];
      
      const { data: creators, error: creatorsError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", creatorIds);

      if (!creatorsError && creators) {
        const creatorMap = creators.reduce((acc, creator) => {
          acc[creator.id] = creator;
          return acc;
        }, {} as Record<string, any>);

        challenges.forEach(challenge => {
          challenge.creator = creatorMap[challenge.creator_id] || null;
        });
      }
    }

    console.log("Successfully fetched challenges:", {
      total: challenges?.length,
      byStatus: challenges?.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: challenges?.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });

    return NextResponse.json(challenges || []);
  } catch (error) {
    console.error("Unexpected error in GET /api/challenges:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/challenges - Starting request");
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Authentication failed", details: sessionError },
        { status: 401 }
      );
    }

    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", session.user.id);

    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);

    // Create challenge
    const challengeData = {
      title: body.title,
      description: body.description,
      type: body.type,
      status: "upcoming",
      start_date: body.start_date,
      end_date: body.end_date,
      min_participants: 2,
      max_participants: body.max_participants || null,
      creator_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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

    console.log("Challenge created:", challenge);

    // Insert goals
    if (body.goals?.length > 0) {
      const goalsData = body.goals.map((goal: any) => ({
        challenge_id: challenge.id,
        type: goal.type,
        target: goal.target,
        description: goal.description,
        created_at: new Date().toISOString(),
      }));

      const { error: goalsError } = await supabase
        .from("challenge_goals")
        .insert(goalsData);

      if (goalsError) {
        console.error("Goals creation error:", goalsError);
        return NextResponse.json(
          { error: "Failed to create goals", details: goalsError },
          { status: 500 }
        );
      }
    }

    // Insert rewards
    if (body.rewards?.length > 0) {
      const rewardsData = body.rewards.map((reward: any) => ({
        challenge_id: challenge.id,
        type: reward.type,
        name: reward.name,
        description: reward.description,
        created_at: new Date().toISOString()
      }));

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
    if (body.rules?.length > 0) {
      const rulesData = body.rules.map((rule: any) => ({
        challenge_id: challenge.id,
        rule: typeof rule === 'string' ? rule : rule.rule,
        created_at: new Date().toISOString()
      }));

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
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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

    return NextResponse.json({
      message: "Challenge created successfully",
      challenge: {
        ...challenge,
        goals: body.goals || [],
        rewards: body.rewards || [],
        rules: body.rules || [],
      }
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/challenges:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ... rest of the file remains the same 