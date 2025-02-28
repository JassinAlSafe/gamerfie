import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select(`
        *,
        goals:challenge_goals(*)
      `)
      .eq("id", params.id)
      .single();

    if (challengeError) throw challengeError;
    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get user's game progress
    const { data: gameProgress, error: gameError } = await supabase
      .from("user_games")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("game_id", challenge.game_id)
      .single();

    if (gameError) {
      return NextResponse.json(
        { error: "Game progress not found" },
        { status: 404 }
      );
    }

    // Calculate progress based on goal type
    let progress = 0;
    for (const goal of challenge.goals) {
      switch (goal.type) {
        case "play_time":
          progress = Math.min(100, (gameProgress.play_time / goal.target) * 100);
          break;
        // Add other goal types here as needed
      }
    }

    // Update participant progress
    const { error: progressError } = await supabase
      .from("challenge_participants")
      .update({
        progress,
        completed: progress === 100,
        completed_at: progress === 100 ? new Date().toISOString() : null
      })
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (progressError) throw progressError;

    // If challenge is completed, award any badge rewards
    if (progress === 100) {
      const { data: rewards, error: rewardsError } = await supabase
        .from("challenge_rewards")
        .select("*")
        .eq("challenge_id", params.id)
        .eq("type", "badge");

      if (rewardsError) throw rewardsError;

      for (const reward of rewards) {
        await supabase.from("user_badges").insert({
          user_id: session.user.id,
          badge_id: reward.badge_id,
          challenge_id: params.id,
          claimed_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      progress,
      completed: progress === 100
    });
  } catch (error) {
    console.error("Error in progress update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get progress for a challenge
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get challenge progress data
    const { data: progress, error } = await supabase
      .from('challenge_participants')
      .select(`
        user_id,
        progress,
        completed,
        team_id,
        updated_at,
        user:profiles!user_id(*),
        team:challenge_teams!team_id(
          name,
          progress:team_progress_history(
            progress,
            recorded_at
          )
        ),
        achievements:participant_achievements(
          achieved_at,
          milestone:progress_milestones(
            title,
            description,
            required_progress,
            reward_type,
            reward_amount
          )
        )
      `)
      .eq('challenge_id', params.id)
      .order('progress', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get milestones for the challenge
    const { data: milestones, error: milestonesError } = await supabase
      .from('progress_milestones')
      .select('*')
      .eq('challenge_id', params.id)
      .order('required_progress', { ascending: true });

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
    }

    return NextResponse.json({
      participants: progress,
      milestones: milestones || [],
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 