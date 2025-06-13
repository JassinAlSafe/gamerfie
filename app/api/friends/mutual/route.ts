import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering due to cookies and request.url usage
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friend_id');

    if (!friendId) {
      return NextResponse.json(
        { error: 'friend_id parameter is required' },
        { status: 400 }
      );
    }

    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the optimized get_mutual_friends function
    const { data: mutualFriends, error } = await supabase
      .rpc('get_mutual_friends', {
        user1_id: user.id,
        user2_id: friendId
      });

    if (error) {
      console.error('Error fetching mutual friends:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mutual friends' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mutual_friends: mutualFriends || [],
      count: mutualFriends?.length || 0
    });
  } catch (error) {
    console.error('Mutual friends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 