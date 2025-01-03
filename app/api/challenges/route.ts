import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "date";
    const filter = searchParams.get("filter") || "all";

    console.log("GET /api/challenges - Query params:", { type, status, sort, filter });

    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
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
      console.log("No authenticated session");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", session.user.id);

    try {
      // First, get the challenge IDs where the user is a participant
      const { data: participations, error: participationsError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", session.user.id);

      if (participationsError) {
        console.error("Error fetching participations:", participationsError);
        return NextResponse.json(
          { error: "Failed to fetch participations", details: participationsError },
          { status: 500 }
        );
      }

      // Create a set of challenge IDs the user is participating in
      const participatingChallengeIds = new Set(participations?.map(p => p.challenge_id) || []);

      // Base query for challenges
      let query = supabase
        .from("challenges")
        .select(`
          *,
          creator:profiles!creator_id (
            id,
            username,
            avatar_url
          ),
          challenge_goals!challenge_id (
            id,
            type,
            target,
            description
          ),
          challenge_participants!challenge_id (
            user_id,
            joined_at,
            user:profiles!user_id (
              id,
              username,
              avatar_url
            )
          ),
          challenge_rewards!challenge_id (
            id,
            type,
            name,
            description
          ),
          challenge_media!challenge_id (
            id,
            media_type,
            url
          )
        `);

      // Apply filters based on query parameters
      if (type) {
        query = query.eq('type', type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      // Apply participation filter
      if (filter === "participating" && participations?.length > 0) {
        query = query.in('id', participations.map(p => p.challenge_id));
      }

      // Execute the query
      const { data: challenges, error: challengesError } = await query;

      if (challengesError) {
        console.error("Error fetching challenges:", {
          code: challengesError.code,
          message: challengesError.message,
          details: challengesError.details,
          hint: challengesError.hint
        });
        return NextResponse.json(
          { error: "Failed to fetch challenges", details: challengesError },
          { status: 500 }
        );
      }

      if (!challenges) {
        console.log("No challenges found");
        return NextResponse.json([]);
      }

      // Add isParticipating flag to each challenge
      const enrichedChallenges = challenges.map(challenge => ({
        ...challenge,
        isParticipating: participatingChallengeIds.has(challenge.id)
      }));

      console.log("Successfully fetched challenges:", {
        total: enrichedChallenges.length,
        participating: participations?.length || 0,
        firstChallenge: enrichedChallenges[0]
      });

      return NextResponse.json(enrichedChallenges);
    } catch (error) {
      console.error("Error in challenges query:", error);
      return NextResponse.json(
        { error: "Failed to execute challenges query", details: error },
        { status: 500 }
      );
    }
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

    // Validate required fields
    if (!body.title || !body.description || !body.type || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create challenge
    if (!body.goals?.[0]) {
      return NextResponse.json(
        { error: "At least one goal is required" },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: challenge, error: challengeError } = await supabase.rpc('create_challenge', {
      challenge_data: {
        title: body.title,
        description: body.description,
        type: body.type,
        status: "upcoming",
        start_date: body.start_date,
        end_date: body.end_date,
        min_participants: body.min_participants || 2,
        max_participants: body.max_participants || null,
        creator_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      goals_data: body.goals.map((goal: any) => ({
        type: goal.type,
        target: goal.target,
        description: goal.description || null
      })),
      rewards_data: body.rewards?.map((reward: any) => ({
        type: reward.type,
        name: reward.name,
        description: reward.description || null,
        badge_id: reward.badge_id || null
      })) || [],
      rules_data: body.rules?.map((rule: any) => ({
        rule: typeof rule === 'string' ? rule : rule.rule
      })) || [],
      cover_url: body.cover_url || null
    });

    if (challengeError) {
      console.error("Challenge creation error:", challengeError);
      return NextResponse.json(
        { error: "Failed to create challenge", details: challengeError },
        { status: 500 }
      );
    }

    console.log("Challenge created successfully:", challenge);

    return NextResponse.json({
      message: "Challenge created successfully",
      challenge
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