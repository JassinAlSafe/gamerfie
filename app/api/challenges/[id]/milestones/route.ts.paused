import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Create a new milestone
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

    // Check if user is the challenge creator
    const { data: challenge } = await supabase
      .from('challenges')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (!challenge || challenge.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Only challenge creator can add milestones' },
        { status: 403 }
      );
    }

    const { title, description, required_progress, reward_type, reward_amount } = await request.json();

    // Validate input
    if (!title || typeof required_progress !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (required_progress < 0 || required_progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress requirement' },
        { status: 400 }
      );
    }

    // Create milestone
    const { data: milestone, error } = await supabase
      .from('progress_milestones')
      .insert({
        challenge_id: params.id,
        title,
        description,
        required_progress,
        reward_type,
        reward_amount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all milestones for a challenge
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: milestones, error } = await supabase
      .from('progress_milestones')
      .select(`
        *,
        achievements:participant_achievements(
          participant_id,
          achieved_at
        )
      `)
      .eq('challenge_id', params.id)
      .order('required_progress', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a milestone
export async function PUT(
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

    // Check if user is the challenge creator
    const { data: challenge } = await supabase
      .from('challenges')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (!challenge || challenge.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Only challenge creator can update milestones' },
        { status: 403 }
      );
    }

    const { milestone_id, title, description, required_progress, reward_type, reward_amount } = await request.json();

    // Validate input
    if (!milestone_id || !title || typeof required_progress !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (required_progress < 0 || required_progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress requirement' },
        { status: 400 }
      );
    }

    // Update milestone
    const { data: milestone, error } = await supabase
      .from('progress_milestones')
      .update({
        title,
        description,
        required_progress,
        reward_type,
        reward_amount,
      })
      .eq('id', milestone_id)
      .eq('challenge_id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 