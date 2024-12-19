import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { FriendActivity } from '../../../../types/friend';

interface ActivityData {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  game: {
    id: string;
    name: string;
    cover_url?: string;
  };
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = 20;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get user's friends
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', session.user.id)
      .eq('status', 'accepted');

    if (!friends || friends.length === 0) {
      return NextResponse.json([]);
    }

    const friendIds = friends.map(f => f.friend_id);

    // Then get activities from those friends
    const { data: activities, error } = await supabase
      .from('friend_activities')
      .select(`
        id,
        activity_type,
        details,
        created_at,
        user:user_id (
          id,
          raw_user_meta_data->username,
          raw_user_meta_data->avatar_url
        ),
        game:game_id (
          id,
          name,
          cover_url
        )
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as { data: ActivityData[] | null; error: any };

    if (error) throw error;
    if (!activities) return NextResponse.json([]);

    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      activity_type: activity.activity_type,
      details: activity.details,
      created_at: activity.created_at,
      user: {
        id: activity.user.id,
        username: activity.user.username,
        avatar_url: activity.user.avatar_url
      },
      game: {
        id: activity.game.id,
        name: activity.game.name,
        cover_url: activity.game.cover_url
      }
    }));

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error('Friend activities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 