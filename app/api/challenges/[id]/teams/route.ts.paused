import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    const { name, description, team_type, max_members } = await request.json();

    // Validate input
    if (!name || !team_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('challenge_teams')
      .insert({
        challenge_id: params.id,
        name,
        description,
        team_type,
        max_members,
      })
      .select()
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: teamError.message },
        { status: 500 }
      );
    }

    // Add creator as first team member
    const { error: participantError } = await supabase
      .from('challenge_participants')
      .update({ team_id: team.id })
      .match({
        challenge_id: params.id,
        user_id: user.id,
      });

    if (participantError) {
      return NextResponse.json(
        { error: participantError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: teams, error } = await supabase
      .from('challenge_teams')
      .select(`
        *,
        participants:challenge_participants (
          user_id,
          progress,
          joined_at
        )
      `)
      .eq('challenge_id', params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 