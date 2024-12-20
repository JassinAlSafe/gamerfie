import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error');
    }
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { activity_type, game_id, details } = await request.json();
    console.log('Creating activity:', { activity_type, game_id, details, user_id: session.user.id });

    if (!activity_type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    // First insert the activity
    const { data: newActivity, error: insertError } = await supabase
      .from('friend_activities')
      .insert({
        user_id: session.user.id,
        activity_type,
        game_id: game_id || null,
        details: details || {},
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting activity:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return NextResponse.json({ 
        error: 'Failed to create activity',
        details: insertError.message
      }, { status: 500 });
    }

    // Then fetch the activity details in separate queries
    const { data: activity } = await supabase
      .from('friend_activities')
      .select('*')
      .eq('id', newActivity.id)
      .single();

    if (!activity) {
      console.error('No activity found after creation');
      return NextResponse.json({ 
        error: 'Activity not found after creation'
      }, { status: 500 });
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', activity.user_id)
      .single();

    // Fetch game details if there's a game_id
    let gameDetails = null;
    if (activity.game_id) {
      const { data: game } = await supabase
        .from('games')
        .select('id, name, cover_url')
        .eq('id', activity.game_id)
        .single();
      gameDetails = game;
    }

    // Transform the response to match the expected format
    const transformedActivity = {
      id: activity.id,
      type: activity.activity_type,
      details: activity.details,
      timestamp: activity.created_at,
      user: userProfile ? {
        id: userProfile.id,
        username: userProfile.username,
        avatar_url: userProfile.avatar_url,
      } : null,
      game: gameDetails ? {
        id: gameDetails.id,
        name: gameDetails.name,
        cover_url: gameDetails.cover_url,
      } : null,
    };

    return NextResponse.json(transformedActivity);
  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 