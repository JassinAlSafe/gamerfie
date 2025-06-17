import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create the news_posts table
    const createTableSQL = `
      -- Create news_posts table
      CREATE TABLE IF NOT EXISTS news_posts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT,
          content TEXT NOT NULL,
          featured_image TEXT,
          category TEXT NOT NULL CHECK (category IN ('Product Update', 'Feature', 'Announcement', 'Security', 'Community')),
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
          badge TEXT,
          published_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          author_id UUID REFERENCES profiles(id) ON DELETE SET NULL
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts(status);
      CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts(category);
      CREATE INDEX IF NOT EXISTS idx_news_posts_published_at ON news_posts(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);

      -- Enable RLS
      ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Published news posts are viewable by everyone" ON news_posts;
      DROP POLICY IF EXISTS "Only admins can manage news posts" ON news_posts;

      -- RLS Policies
      -- Everyone can read published posts
      CREATE POLICY "Published news posts are viewable by everyone"
          ON news_posts FOR SELECT
          USING (status = 'published');

      -- Only admins can manage all posts
      CREATE POLICY "Only admins can manage news posts"
          ON news_posts FOR ALL
          USING (
              EXISTS (
                  SELECT 1 FROM profiles
                  WHERE id = auth.uid()
                  AND role = 'admin'
              )
          );

      -- Function to automatically update updated_at
      CREATE OR REPLACE FUNCTION update_news_posts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger to automatically update updated_at
      DROP TRIGGER IF EXISTS update_news_posts_updated_at ON news_posts;
      CREATE TRIGGER update_news_posts_updated_at
          BEFORE UPDATE ON news_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_news_posts_updated_at();
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error('Error creating news table:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'News system setup completed successfully' });
  } catch (error) {
    console.error('Error setting up news system:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}