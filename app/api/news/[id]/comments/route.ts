import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: postId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // First, verify the post exists and has comments enabled
    const { data: post, error: postError } = await supabase
      .from('news_posts')
      .select('id, comments_enabled, status')
      .eq('id', postId)
      .eq('status', 'published')
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.comments_enabled) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 403 });
    }

    // Fetch comments with author information
    const { data: comments, error } = await supabase
      .from('news_comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        is_edited,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('news_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (countError) {
      console.error('Count error:', countError);
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    // Transform the data to match our interface
    const transformedComments = (comments || []).map(comment => ({
      ...comment,
      author: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
    }));

    return NextResponse.json({
      comments: transformedComments,
      total,
      page,
      limit,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: postId } = params;

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the post exists and has comments enabled
    const { data: post, error: postError } = await supabase
      .from('news_posts')
      .select('id, comments_enabled, status')
      .eq('id', postId)
      .eq('status', 'published')
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.comments_enabled) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 403 });
    }

    // Check if user has a profile, create one if not
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const username = session.user.email?.split('@')[0] || `user_${session.user.id.slice(0, 8)}`;
      const displayName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name || 
                         session.user.user_metadata?.display_name ||
                         username;

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          username,
          display_name: displayName,
          email: session.user.email || null,
          avatar_url: session.user.user_metadata?.avatar_url || 
                     session.user.user_metadata?.picture || null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json({ 
          error: 'Failed to create user profile. Please try again.' 
        }, { status: 500 });
      }
    } else if (profileError) {
      console.error('Error checking profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to verify user profile. Please try again.' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { content } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const newComment = {
      post_id: postId,
      author_id: session.user.id,
      content: content.trim(),
    };

    const { data, error } = await supabase
      .from('news_comments')
      .insert([newComment])
      .select(`
        id,
        post_id,
        author_id,
        content,
        is_edited,
        created_at,
        updated_at,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to match our interface
    const transformedComment = {
      ...data,
      author: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    };

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}