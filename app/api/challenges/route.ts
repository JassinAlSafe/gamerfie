import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

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
    console.log("Starting challenge creation process...");
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      );
    }
    
    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", session.user.id);

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    console.log("User profile found:", profile.id);

    const json = await request.json();
    console.log("Received challenge data:", json);

    const { rewards, rules, tags, goal, start_date, end_date, ...challengeData } = json;

    // Prepare challenge data with flattened goal and formatted dates
    const challengeWithGoal = {
      ...challengeData,
      goal_type: goal.type,
      goal_target: goal.target,
      creator_id: profile.id,
      status: "upcoming",
      start_date: new Date(start_date).toISOString(),
      end_date: new Date(end_date).toISOString(),
    };

    console.log("Creating challenge with data:", challengeWithGoal);

    // Create challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert(challengeWithGoal)
      .select()
      .single();

    if (challengeError) {
      console.error("Challenge creation error:", challengeError);
      return NextResponse.json(
        { error: challengeError.message },
        { status: 500 }
      );
    }

    console.log("Challenge created successfully:", challenge);

    // Create rewards if any
    if (rewards?.length > 0) {
      console.log("Creating rewards:", rewards);
      const { error: rewardsError } = await supabase
        .from("challenge_rewards")
        .insert(
          rewards.map((reward: any) => ({
            ...reward,
            challenge_id: challenge.id,
          }))
        );

      if (rewardsError) {
        console.error("Rewards creation error:", rewardsError);
        return NextResponse.json(
          { error: rewardsError.message },
          { status: 500 }
        );
      }
    }

    // Create rules if any
    if (rules?.length > 0) {
      console.log("Creating rules:", rules);
      const { error: rulesError } = await supabase
        .from("challenge_rules")
        .insert(
          rules.map((rule: string) => ({
            rule,
            challenge_id: challenge.id,
          }))
        );

      if (rulesError) {
        console.error("Rules creation error:", rulesError);
        return NextResponse.json(
          { error: rulesError.message },
          { status: 500 }
        );
      }
    }

    // Create tags if any
    if (tags?.length > 0) {
      console.log("Creating tags:", tags);
      const { error: tagsError } = await supabase
        .from("challenge_tags")
        .insert(
          tags.map((tag: string) => ({
            tag,
            challenge_id: challenge.id,
          }))
        );

      if (tagsError) {
        console.error("Tags creation error:", tagsError);
        return NextResponse.json(
          { error: tagsError.message },
          { status: 500 }
        );
      }
    }

    // Fetch complete challenge data
    console.log("Fetching complete challenge data...");
    const { data: completeChallenge, error: fetchError } = await supabase
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
        rewards:challenge_rewards(*),
        rules:challenge_rules(*),
        tags:challenge_tags(*)
      `)
      .eq("id", challenge.id)
      .single();

    if (fetchError) {
      console.error("Fetch complete challenge error:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Transform the response to match the expected format
    const responseData = {
      ...completeChallenge,
      goal: {
        type: completeChallenge.goal_type,
        target: completeChallenge.goal_target
      }
    };

    console.log("Challenge creation completed successfully");
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to create challenge:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create challenge" },
      { status: 500 }
    );
  }
} 