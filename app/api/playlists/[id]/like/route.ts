import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playlistId = params.id;

    // Check if user has already liked this playlist
    const { data: existingLike, error: checkError } = await supabase
      .from('playlist_likes')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('playlist_likes')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      return NextResponse.json({ liked: false, message: 'Playlist unliked' });
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('playlist_likes')
        .insert({
          playlist_id: playlistId,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      return NextResponse.json({ liked: true, message: 'Playlist liked' });
    }
  } catch (error) {
    console.error('Like playlist error:', error);
    return NextResponse.json(
      { error: 'Failed to update like status' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ liked: false, count: 0 });
    }

    const playlistId = params.id;

    // Get like status and count
    const [likeStatus, likeCount] = await Promise.all([
      supabase
        .from('playlist_likes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('playlist_likes')
        .select('id', { count: 'exact' })
        .eq('playlist_id', playlistId)
    ]);

    return NextResponse.json({
      liked: !!likeStatus.data,
      count: likeCount.count || 0
    });
  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json({ liked: false, count: 0 });
  }
}