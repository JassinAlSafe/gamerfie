import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';



export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { status } = await request.json();
    
    // Validate status is one of the allowed values
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update friend status
    const { data: updatedFriend, error: updateError } = await supabase
      .from('friends')
      .update({ status })
      .match({
        friend_id: session.user.id,
        user_id: params.id,
        status: 'pending'
      })
      .select()
      .single();

    if (updateError) throw updateError;

    // Fetch friend's profile details separately
    const { data: friendProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .eq('id', params.id)
      .single();

    if (profileError) throw profileError;

    // Transform the response to match your Friend interface
    const transformedFriend = {
      id: friendProfile.id,
      username: friendProfile.username,
      status: updatedFriend.status,
      bio: friendProfile.bio,
      avatar_url: friendProfile.avatar_url,
      sender_id: updatedFriend.user_id
    };

    return NextResponse.json(transformedFriend);
  } catch (error) {
    console.error('Friend status update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete friend connection
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${session.user.id},friend_id.eq.${params.id}),and(user_id.eq.${params.id},friend_id.eq.${session.user.id})`);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Friend deletion error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 