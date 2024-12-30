import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Update progress for a participant
export async function POST(
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

    const { progress } = await request.json();

    // Validate input
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('id, team_id')
      .match({
        challenge_id: params.id,
        user_id: user.id,
      })
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant in this challenge' },
        { status: 403 }
      );
    }

    // Update participant progress
    const { error: updateError } = await supabase
      .from('challenge_participants')
      .update({
        progress,
        completed: progress === 100,
        updated_at: new Date().toISOString(),
      })
      .match({
        challenge_id: params.id,
        user_id: user.id,
      });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Record progress history
    const { error: historyError } = await supabase
      .from('team_progress_history')
      .insert({
        team_id: participant.team_id,
        progress,
        recorded_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Error recording progress history:', historyError);
    }

    // Check and award milestones
    const { data: milestones } = await supabase
      .from('progress_milestones')
      .select('id, required_progress')
      .eq('challenge_id', params.id)
      .lte('required_progress', progress)
      .order('required_progress', { ascending: true });

    if (milestones) {
      for (const milestone of milestones) {
        // Try to award milestone (will fail silently if already awarded due to UNIQUE constraint)
        await supabase
          .from('participant_achievements')
          .insert({
            participant_id: participant.id,
            milestone_id: milestone.id,
            achieved_at: new Date().toISOString(),
          })
          .select()
          .single();
      }
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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