import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface FriendData {
  id: string;
  status: string;
  friend: {
    id: string;
    username: string;
  };
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

    // Get all unique user IDs from both user_id and friend_id fields
    const userIds = [...new Set(friends.map(f => 
      f.user_id === session.user.id ? f.friend_id : f.user_id
    ))];

    // Fetch user details from profiles
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (!users) return NextResponse.json([]);

    // Create a map of user details
    const userMap = new Map(users.map(user => [user.id, user]));

    // Transform the data
    const transformedFriends = friends.map(f => {
      const friendId = f.user_id === session.user.id ? f.friend_id : f.user_id;
      const friendData = userMap.get(friendId);
      return {
        id: friendId,
        username: friendData?.username || '',
        status: f.status,
        bio: friendData?.bio || '',
        avatar_url: friendData?.avatar_url,
        sender_id: f.user_id,
        display_name: friendData?.display_name
      };
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

    // Check if friendship already exists
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`)
      .single();

    if (existingFriend) {
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

    if (insertError) throw insertError;
    if (!friendship) throw new Error('Failed to create friend request');

    // Fetch friend details from profiles
    const { data: friendData } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', friendId)
      .single();

    if (!friendData) throw new Error('Failed to fetch friend details');

    const transformedFriend = {
      id: friendId,
      username: friendData.username,
      status: friendship.status
    };

    return NextResponse.json(transformedFriend);
  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
