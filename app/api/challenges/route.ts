import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force dynamic rendering due to cookies and request.url usage
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "date";
    const filter = searchParams.get("filter") || "all";

    console.log("GET /api/challenges - Query params:", { type, status, sort, filter });

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      return NextResponse.json(
        { error: "Authentication failed", details: userError },
        { status: 401 }
      );
    }

    if (!user) {
      console.log("No authenticated user");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Authenticated user:", user.id);

    try {
      // First, get the challenge IDs where the user is a participant
      const { data: participations, error: participationsError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id);

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

      // Apply sorting
      switch (sort) {
        case "date":
          query = query.order("created_at", { ascending: false });
          break;
        case "participants":
          // We'll sort by participant count on the client side after fetching
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
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
        isParticipating: participatingChallengeIds.has(challenge.id),
        participantCount: challenge.challenge_participants?.length || 0
      }));

      // Sort by participant count if requested
      if (sort === "participants") {
        enrichedChallenges.sort((a, b) => b.participantCount - a.participantCount);
      }

      console.log("Successfully fetched challenges:", {
        total: enrichedChallenges.length,
        participating: participations?.length || 0,
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
    
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("User error:", userError);
      return NextResponse.json(
        { error: "Authentication failed", details: userError },
        { status: 401 }
      );
    }

    if (!user) {
      console.log("No user found");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.id);

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

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert({
        title: body.title,
        description: body.description,
        type: body.type,
        status: "active",
        start_date: body.start_date,
        end_date: body.end_date,
        creator_id: user.id,
        max_participants: body.max_participants || null,
        is_team_based: body.is_team_based || false,
        visibility: body.visibility || "public",
        banner_url: body.banner_url || null,
        rules: body.rules || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (challengeError) {
      console.error("Error creating challenge:", challengeError);
      return NextResponse.json(
        { error: "Failed to create challenge", details: challengeError },
        { status: 500 }
      );
    }

    console.log("Challenge created:", challenge.id);

    // Add goals if provided
    if (body.goals && Array.isArray(body.goals) && body.goals.length > 0) {
      const goalsToInsert = body.goals.map((goal: any) => ({
        challenge_id: challenge.id,
        type: goal.type,
        target: goal.target,
        description: goal.description
      }));

      const { error: goalsError } = await supabase
        .from("challenge_goals")
        .insert(goalsToInsert);

      if (goalsError) {
        console.error("Error creating goals:", goalsError);
        // Don't fail the whole request for goals error
      }
    }

    // Add rewards if provided
    if (body.rewards && Array.isArray(body.rewards) && body.rewards.length > 0) {
      const rewardsToInsert = body.rewards.map((reward: any) => ({
        challenge_id: challenge.id,
        type: reward.type,
        name: reward.name,
        description: reward.description
      }));

      const { error: rewardsError } = await supabase
        .from("challenge_rewards")
        .insert(rewardsToInsert);

      if (rewardsError) {
        console.error("Error creating rewards:", rewardsError);
        // Don't fail the whole request for rewards error
      }
    }

    // Add rules if provided
    if (body.challenge_rules && Array.isArray(body.challenge_rules) && body.challenge_rules.length > 0) {
      const rulesToInsert = body.challenge_rules.map((rule: string) => ({
        challenge_id: challenge.id,
        rule: rule
      }));

      const { error: rulesError } = await supabase
        .from("challenge_rules")
        .insert(rulesToInsert);

      if (rulesError) {
        console.error("Error creating rules:", rulesError);
        // Don't fail the whole request for rules error
      }
    }

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/challenges:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error },
      { status: 500 }
    );
  }
} 