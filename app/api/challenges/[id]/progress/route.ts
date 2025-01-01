import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
  goalProgress: z.record(z.string(), z.number()).optional(),
});

export async function POST(
  request: Request,
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

    // Validate request body
    const body = await request.json();
    const { progress, goalProgress } = progressUpdateSchema.parse(body);

    console.log("Processing challenge progress update:", {
      challengeId: params.id,
      userId: session.user.id,
      progress,
      goalProgress
    });

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select(`
        *,
        goals:challenge_goals(*),
        rewards:challenge_rewards(*)
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

    console.log("Found challenge:", {
      challengeId: challenge.id,
      rewards: challenge.rewards
    });

    // Update participant progress
    const { error: progressError } = await supabase
      .from("challenge_participants")
      .update({
        progress,
        goal_progress: goalProgress || {},
        completed: progress === 100,
        completed_at: progress === 100 ? new Date().toISOString() : null
      })
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id);

    if (progressError) throw progressError;

    // If challenge is completed, award any badge rewards
    if (progress === 100) {
      console.log("Challenge completed! Processing badge rewards...");
      const badgeRewards = challenge.rewards.filter(reward => reward.type === 'badge');
      console.log("Found badge rewards:", badgeRewards);
      
      for (const reward of badgeRewards) {
        // Check if badge is assigned to challenge
        const { data: challengeBadge, error: badgeError } = await supabase
          .from("challenge_badges")
          .select("badge_id")
          .eq("challenge_id", params.id)
          .eq("badge_id", reward.badge_id)
          .single();

        if (badgeError) {
          console.error("Error checking challenge badge:", badgeError);
          continue;
        }

        console.log("Found challenge badge:", challengeBadge);

        if (challengeBadge) {
          // Award the badge
          const { data: awarded, error: awardError } = await supabase.rpc("award_badge_to_user", {
            p_user_id: session.user.id,
            p_badge_id: challengeBadge.badge_id,
            p_challenge_id: params.id
          });

          if (awardError) {
            console.error("Error awarding badge:", awardError);
          } else {
            console.log("Badge award result:", awarded);
          }
        }
      }
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return NextResponse.json(
      { error: "Failed to update challenge progress" },
      { status: 500 }
    );
  }
}

// Get progress for a challenge
export async function GET(
  request: Request,
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