import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';
import { FriendActivity, ActivityType } from '../../../../../types/activity';

const COOLDOWN_PERIODS: Record<ActivityType, number> = {
  started_playing: 24 * 60 * 60, // 24 hours in seconds
  completed: 0, // No cooldown for completing games
  achievement: 5 * 60, // 5 minutes in seconds
  review: 0, // No cooldown for reviews
  want_to_play: 60 * 60, // 1 hour in seconds
  progress: 30 * 60, // 30 minutes in seconds
  game_status_updated: 0, // No cooldown
  achievement_unlocked: 5 * 60, // 5 minutes in seconds
  game_completed: 0, // No cooldown
  review_added: 0 // No cooldown
};

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User error:', userError);
      throw new Error('Authentication error');
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { activity_type, game_id, details } = await request.json() as { 
      activity_type: ActivityType; 
      game_id: string; 
      details?: any 
    };
    console.log('Creating activity:', { activity_type, game_id, details, user_id: user.id });

    if (!activity_type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    // Check cooldown period
    const cooldownPeriod = COOLDOWN_PERIODS[activity_type];
    if (cooldownPeriod > 0) {
      const { data: recentActivity } = await supabase
        .from('friend_activities')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('game_id', game_id)
        .eq('activity_type', activity_type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentActivity) {
        const lastActivityTime = new Date(recentActivity.created_at).getTime() / 1000;
        const currentTime = Date.now() / 1000;
        const timeSinceLastActivity = currentTime - lastActivityTime;

        if (timeSinceLastActivity < cooldownPeriod) {
          const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastActivity) / 60);
          return NextResponse.json({
            error: `Please wait ${remainingTime} minutes before posting another ${activity_type.replace('_', ' ')} activity for this game.`
          }, { status: 429 });
        }
      }
    }

    // First insert the activity
    const { data: newActivity, error: insertError } = await supabase
      .from('friend_activities')
      .insert({
        user_id: user.id,
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

    console.log('Activity inserted successfully:', newActivity);

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

    console.log('Activity fetched:', activity);

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', activity.user_id)
      .single();

    console.log('User profile fetched:', userProfile);

    // Fetch game details if there's a game_id
    let gameDetails = null;
    if (activity.game_id) {
      const { data: game } = await supabase
        .from('games')
        .select('id, name, cover_url')
        .eq('id', activity.game_id)
        .single();
      gameDetails = game;
      console.log('Game details fetched:', gameDetails);
    }

    // Transform the response to match the expected format
    const transformedActivity: FriendActivity = {
      id: activity.id,
      type: activity.activity_type,
      user_id: activity.user_id,
      game_id: activity.game_id,
      timestamp: activity.created_at,
      created_at: activity.created_at,
      details: activity.details,
      user: userProfile ? {
        id: userProfile.id,
        username: userProfile.username,
        avatar_url: userProfile.avatar_url,
      } : {
        id: activity.user_id,
        username: 'Unknown User',
        avatar_url: null,
      },
      game: gameDetails ? {
        id: gameDetails.id,
        name: gameDetails.name,
        cover_url: gameDetails.cover_url,
      } : {
        id: activity.game_id,
        name: 'Unknown Game',
        cover_url: null,
      },
    };

    console.log('Transformed activity:', transformedActivity);

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