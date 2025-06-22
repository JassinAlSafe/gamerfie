import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force dynamic rendering due to cookies and request.url usage
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'Challenges API endpoint' });
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