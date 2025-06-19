import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthResult } from '../../lib/auth';



export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return authResult; // Return the error response
    }
    
    const { user, supabase } = authResult;
    const { status } = await request.json();
    
    // Validate status is one of the allowed values
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update friend status - handle both directions of friendship
    const { data: updatedFriend, error: updateError } = await supabase
      .from('friends')
      .update({ status })
      .or(`and(friend_id.eq.${user.id},user_id.eq.${params.id},status.eq.pending),and(user_id.eq.${user.id},friend_id.eq.${params.id},status.eq.pending)`)
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
  try {
    const authResult = await authenticateRequest();
    if (!isAuthResult(authResult)) {
      return authResult; // Return the error response
    }
    
    const { user, supabase } = authResult;

    // Delete friend connection
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${params.id}),and(user_id.eq.${params.id},friend_id.eq.${user.id})`);

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