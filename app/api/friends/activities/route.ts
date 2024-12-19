import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { FriendActivity } from '../../../../types/friend';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 20;

  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Authentication error');
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', session.user.id)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }

    if (!friends || friends.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const friendIds = friends.map(f => f.friend_id);

    // First, let's check if we have any activities
    const { data: activities, error: activitiesError } = await supabase
      .from('friend_activities')
      .select('*')
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Now let's get the user profiles for these activities
    const userIds = activities.map(a => a.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // And get the games
    const gameIds = activities.filter(a => a.game_id).map(a => a.game_id);
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .in('id', gameIds);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }

    // Create lookup maps for faster access
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const gameMap = new Map(games?.map(g => [g.id, g]) || []);

    // Transform the activities with joined data
    const transformedActivities = activities.map(activity => {
      const profile = profileMap.get(activity.user_id);
      const game = activity.game_id ? gameMap.get(activity.game_id) : null;

      return {
        id: activity.id,
        type: activity.activity_type,
        details: activity.details,
        timestamp: activity.created_at,
        user: profile ? {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
        } : null,
        game: game ? {
          id: game.id,
          name: game.name,
          cover_url: game.cover_url,
        } : null,
      };
    });

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error('Friend activities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 

