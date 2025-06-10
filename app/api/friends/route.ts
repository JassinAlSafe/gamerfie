import { createClient } from '@/utils/supabase/server';
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


export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get friend requests and friendships
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          bio
        ),
        sender:profiles!friendships_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) {
      console.error('Error fetching friends:', error);
      return NextResponse.json(
        { error: 'Failed to fetch friends' },
        { status: 500 }
      );
    }

    const friends: FriendData[] = friendships?.map(friendship => {
      const isRequester = friendship.user_id === user.id;
      const friendProfile = isRequester ? friendship.friend : friendship.sender;
      
      return {
        id: friendProfile.id,
        username: friendProfile.username,
        display_name: friendProfile.display_name,
        avatar_url: friendProfile.avatar_url,
        bio: friendProfile.bio,
        status: friendship.status,
        sender_id: friendship.user_id,
      };
    }) || [];

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error in friends API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { friendId } = await request.json();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if friendship already exists in either direction
    const { data: existingFriendship } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendId}),` +
        `and(user_id.eq.${friendId},friend_id.eq.${user.id})`
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
        user_id: user.id,
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
      sender_id: user.id
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
  const supabase = await createClient();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabase
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
