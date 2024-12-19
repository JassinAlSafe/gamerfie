import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { FriendStatus } from '@/types/friend';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { status } = await request.json();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update friend status
    const { data: friend, error } = await supabase
      .from('friends')
      .update({ status })
      .match({
        friend_id: session.user.id,
        user_id: params.id,
        status: 'pending'
      })
      .select('*, friend:profiles!friend_id(*)')
      .single();

    if (error) throw error;
    if (!friend) throw new Error('Friend not found');

    return NextResponse.json(friend);
  } catch (error) {
    console.error('Friend status update error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
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