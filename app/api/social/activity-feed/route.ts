import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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

    // Use the optimized social_activity_feed view for better performance
    // Filter to show activities from friends + current user
    const { data: activities, error, count } = await supabase
      .from('social_activity_feed')
      .select('*', { count: 'exact' })
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

    return NextResponse.json({
      activities: activities || [],
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