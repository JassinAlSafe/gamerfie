import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { friendId: string } }
) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if friendship exists in either direction
    const { data: existingFriendship, error } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${params.friendId}),` +
        `and(user_id.eq.${params.friendId},friend_id.eq.${user.id})`
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