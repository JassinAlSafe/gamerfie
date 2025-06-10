import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';
import { FriendActivity } from '@/types/activity';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 20;

  try {
    // Get authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error('Authentication error');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's friends and include the user's own ID
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }

    // Include both friends' IDs and the user's own ID
    const userIds = [...(friends?.map(f => f.friend_id) || []), user.id];
    console.log('Fetching activities for users:', userIds);

    // First, let's check if we have any activities
    const { data: activities, error: activitiesError } = await supabase
      .from('friend_activities')
      .select(`
        *,
        reactions:activity_reactions(
          id,
          emoji,
          type,
          user_id,
          created_at,
          user:profiles(
            id,
            username,
            avatar_url
          )
        ),
        comments:activity_comments(
          id,
          content,
          created_at,
          user:profiles(
            id,
            username,
            avatar_url
          )
        )
      `)
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // If no activities, return empty array
    if (!activities || activities.length === 0) {
      console.log('No activities found');
      return NextResponse.json([]);
    }

    // Fetch unique user IDs
    const uniqueUserIds = [...new Set(activities.map(a => a.user_id))];
    console.log('Fetching profiles for users:', uniqueUserIds);

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', uniqueUserIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
    }

    // Create profile map
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Fetch unique game IDs
    const uniqueGameIds = [...new Set(activities.map(a => a.game_id).filter(Boolean))];
    console.log('Fetching games for IDs:', uniqueGameIds);

    // Fetch game details
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, name, cover_url')
      .in('id', uniqueGameIds);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
    }

    // Create game map
    const gameMap = new Map(games?.map(g => [g.id, g]) || []);

    // Transform the activities with joined data
    const transformedActivities: FriendActivity[] = activities.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      user_id: activity.user_id,
      game_id: activity.game_id,
      timestamp: activity.created_at,
      created_at: activity.created_at,
      details: activity.details,
      reactions: activity.reactions || [],
      comments: activity.comments || [],
      user: {
        id: activity.user_id,
        username: profileMap.get(activity.user_id)?.username || 'Unknown User',
        avatar_url: profileMap.get(activity.user_id)?.avatar_url || null,
      },
      game: {
        id: activity.game_id,
        name: gameMap.get(activity.game_id)?.name || 'Unknown Game',
        cover_url: gameMap.get(activity.game_id)?.cover_url || null,
      },
    }));

    console.log('Transformed activities:', transformedActivities);

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error('Friend activities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

