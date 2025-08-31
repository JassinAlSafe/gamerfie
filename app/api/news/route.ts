import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('news_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        category,
        status,
        badge,
        published_at,
        created_at,
        updated_at,
        author_id,
        comments_enabled
      `)
      .eq('status', status);

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Order by published_at, fallback to created_at for drafts
    query = query.order('published_at', { ascending: false, nullsFirst: false })
                 .order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    const countQuery = supabase
      .from('news_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (category) {
      countQuery.eq('category', category);
    }

    if (search) {
      countQuery.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count error:', countError);
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    const response = NextResponse.json({
      posts: posts || [],
      total,
      page,
      limit,
      hasMore
    });

    // Add caching headers - 15 minutes for news content
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // SECURITY FIX: Use getUser() not getSession() for database operations
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, featured_image, category, status, badge, published_at, comments_enabled } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const newsPost = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt,
      content,
      featured_image,
      category,
      status: status || 'draft',
      badge,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
      author_id: user.id,
      comments_enabled: comments_enabled ?? true,
    };

    const { data, error } = await supabase
      .from('news_posts')
      .insert([newsPost])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating news post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}