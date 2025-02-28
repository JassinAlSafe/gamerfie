import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

interface FriendData {
  id: string;
  username: string;
  status?: string;
  bio?: string;
  avatar_url?: string;
  sender_id?: string;
  display_name?: string;
}

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  display_name?: string;
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: friends, error } = await query;

    if (error) throw error;
    if (!friends) return NextResponse.json([]);

    // Create a map of user IDs to user data for quick lookup
    const userIds = friends.flatMap(f => [f.user_id, f.friend_id]);
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, bio, avatar_url, display_name')
      .in('id', userIds);

    const userMap = new Map<string, UserProfile>();
    users?.forEach(user => userMap.set(user.id, user));

    // Transform the data
    const transformedFriends = friends.map(f => {
      const friendId = f.user_id === session.user.id ? f.friend_id : f.user_id;
      const friendData = userMap.get(friendId);
      
      const friend: FriendData = {
        id: friendId,
        username: friendData?.username || '',
        status: f.status,
      };
      
      if (friendData?.bio) friend.bio = friendData.bio;
      if (friendData?.avatar_url) friend.avatar_url = friendData.avatar_url;
      if (f.user_id) friend.sender_id = f.user_id;
      if (friendData?.display_name) friend.display_name = friendData.display_name;
      
      return friend;
    });

    return NextResponse.json(transformedFriends);
  } catch (error) {
    console.error('Friends fetch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { friendId } = await request.json();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if friendship already exists in either direction
    const { data: existingFriendship, error: _checkError } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),` +
        `and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`
      )
      .single();

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Friendship already exists' },
        { status: 400 }
      );
    }

    // Create new friendship
    const { data: friendship, error: insertError } = await supabase
      .from('friends')
      .insert({
        user_id: session.user.id,
        friend_id: friendId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating friendship:', insertError);
      return NextResponse.json(
        { error: 'Failed to create friendship' },
        { status: 500 }
      );
    }

    // Fetch friend details
    const { data: friendProfile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', friendId)
      .single();

    return NextResponse.json({
      id: friendship.id,
      username: friendProfile?.username,
      avatar_url: friendProfile?.avatar_url,
      status: friendship.status,
      sender_id: session.user.id
    });
  } catch (error) {
    console.error('Error in POST /api/friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { friendId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: _checkError } = await supabase
      .from("friends")
      .delete()
      .eq("id", params.friendId)
      .eq("user_id", session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
