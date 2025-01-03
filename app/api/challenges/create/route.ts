import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert({
        ...body,
        creator_id: session.user.id,
        status: "upcoming",
      })
      .select()
      .single();

    if (challengeError) throw challengeError;

    // Add goals if present
    if (body.goals?.length) {
      const { error: goalsError } = await supabase
        .from("challenge_goals")
        .insert(
          body.goals.map((goal: any) => ({
            challenge_id: challenge.id,
            ...goal,
          }))
        );

      if (goalsError) throw goalsError;
    }

    // Add rewards if present
    if (body.rewards?.length) {
      const { error: rewardsError } = await supabase
        .from("challenge_rewards")
        .insert(
          body.rewards.map((reward: any) => ({
            challenge_id: challenge.id,
            ...reward,
          }))
        );

      if (rewardsError) throw rewardsError;
    }

    // Add rules if present
    if (body.rules?.length) {
      const { error: rulesError } = await supabase
        .from("challenge_rules")
        .insert(
          body.rules.map((rule: string) => ({
            challenge_id: challenge.id,
            rule,
          }))
        );

      if (rulesError) throw rulesError;
    }

    return NextResponse.json({
      success: true,
      data: challenge,
    });

  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create challenge",
        details: error
      },
      { status: 500 }
    );
  }
} 