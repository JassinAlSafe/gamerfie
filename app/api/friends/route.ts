import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface FriendData {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  display_name?: string;
}

interface FriendRequest {
  user_id: string;
  friend_id: string;
  status: string;
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: friends, error: friendsError } = await supabase
      .from("friends")
      .select("*")
      .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
      return NextResponse.json(
        { error: "Failed to fetch friends" },
        { status: 500 }
      );
    }

    // Get all unique user IDs from both user_id and friend_id fields
    const userIds = Array.from(new Set(friends.map((f: FriendRequest) => 
      f.user_id === session.user.id ? f.friend_id : f.user_id
    )));

    // Fetch user details from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    // Map friend data with profile data
    const friendsList = friends.map((f: FriendRequest) => {
      const friendId = f.user_id === session.user.id ? f.friend_id : f.user_id;
      const friendData = profiles?.find((p: FriendData) => p.id === friendId);

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

    return NextResponse.json(friendsList);
  } catch (error) {
    console.error("Friends fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { friendId } = await request.json();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if friendship already exists in either direction
    const { data: existingFriendship, error: checkError } = await supabase
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
