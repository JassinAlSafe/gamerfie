import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering due to cookies and request.url usage
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get current authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the user's friends
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      return NextResponse.json(
        { error: 'Failed to fetch friends' },
        { status: 500 }
      );
    }

    // Get friend IDs plus current user ID
    const friendIds = friends?.map(f => f.friend_id) || [];
    const userIds = [user.id, ...friendIds];

    // Get activities from friend_activities table with user and game data
    const { data: activities, error, count } = await supabase
      .from('friend_activities')
      .select(`
        *,
        user:profiles!user_id(id, username, avatar_url),
        game:games!game_id(id, name, cover_url)
      `, { count: 'exact' })
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching activity feed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity feed' },
        { status: 500 }
      );
    }

    // Transform the response to match the expected format
    const transformedActivities = (activities || []).map((activity: any) => ({
      id: activity.id,
      activity_type: activity.activity_type,
      user_id: activity.user_id,
      game_id: activity.game_id,
      created_at: activity.created_at,
      details: activity.details || {},
      reactions: [], // Can be expanded later
      comments: [], // Can be expanded later
      username: activity.user?.username,
      avatar_url: activity.user?.avatar_url,
      game_name: activity.game?.name,
      game_cover_url: activity.game?.cover_url,
    }));

    return NextResponse.json({
      activities: transformedActivities,
      hasMore: count ? offset + limit < count : false,
      total: count || 0,
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 