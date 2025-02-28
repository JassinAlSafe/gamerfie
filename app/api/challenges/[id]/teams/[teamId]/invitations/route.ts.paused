import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string; teamId: string } }
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

    const { invitee_id } = await request.json();

    // Validate input
    if (!invitee_id) {
      return NextResponse.json(
        { error: 'Missing invitee_id' },
        { status: 400 }
      );
    }

    // Check if user is in the team
    const { data: membership } = await supabase
      .from('challenge_participants')
      .select('team_id')
      .match({
        challenge_id: params.id,
        user_id: user.id,
        team_id: params.teamId,
      })
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a team member' },
        { status: 403 }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        team_id: params.teamId,
        inviter_id: user.id,
        invitee_id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      if (inviteError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Invitation already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: inviteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; teamId: string } }
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

    const { status } = await request.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update invitation status
    const { data: invitation, error: updateError } = await supabase
      .from('team_invitations')
      .update({ status })
      .match({
        team_id: params.teamId,
        invitee_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' },
        { status: 404 }
      );
    }

    // If accepted, add user to team
    if (status === 'accepted') {
      const { error: joinError } = await supabase
        .from('challenge_participants')
        .update({ team_id: params.teamId })
        .match({
          challenge_id: params.id,
          user_id: user.id,
        });

      if (joinError) {
        return NextResponse.json(
          { error: joinError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string; teamId: string } }
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

    // Get invitations for the team
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        inviter:profiles!inviter_id(*),
        invitee:profiles!invitee_id(*)
      `)
      .match({
        team_id: params.teamId,
        status: 'pending',
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 