import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { friendId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if friendship exists in either direction
    const { data: existingFriendship, error } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${session.user.id},friend_id.eq.${params.friendId}),` +
        `and(user_id.eq.${params.friendId},friend_id.eq.${session.user.id})`
      )
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }

    return NextResponse.json({ exists: !!existingFriendship });
  } catch (error) {
    console.error('Error checking friendship:', error);
    return NextResponse.json(
      { error: 'Failed to check friendship status' },
      { status: 500 }
    );
  }
} 