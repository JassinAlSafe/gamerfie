-- Create forum database schema migration
-- This needs to be run in the Supabase SQL editor

-- Forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT '📁',
    color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum threads table
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    last_post_at TIMESTAMP WITH TIME ZONE,
    last_post_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_post_id UUID REFERENCES forum_posts(id),
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    depth INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum thread likes table
CREATE TABLE IF NOT EXISTS forum_thread_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Forum post likes table
CREATE TABLE IF NOT EXISTS forum_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_post_id ON forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_thread_id ON forum_thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post_id ON forum_post_likes(post_id);

-- Enable RLS on all tables
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories (public read)
DROP POLICY IF EXISTS "Allow public read access to categories" ON forum_categories;
CREATE POLICY "Allow public read access to categories" ON forum_categories FOR SELECT USING (true);

-- RLS Policies for forum_threads (public read, authenticated write)
DROP POLICY IF EXISTS "Allow public read access to threads" ON forum_threads;
CREATE POLICY "Allow public read access to threads" ON forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create threads" ON forum_threads;
CREATE POLICY "Allow authenticated users to create threads" ON forum_threads FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow users to update their own threads" ON forum_threads;
CREATE POLICY "Allow users to update their own threads" ON forum_threads FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS Policies for forum_posts (public read, authenticated write)
DROP POLICY IF EXISTS "Allow public read access to posts" ON forum_posts;
CREATE POLICY "Allow public read access to posts" ON forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON forum_posts;
CREATE POLICY "Allow authenticated users to create posts" ON forum_posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow users to update their own posts" ON forum_posts;
CREATE POLICY "Allow users to update their own posts" ON forum_posts FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS Policies for likes (authenticated users only)
DROP POLICY IF EXISTS "Allow authenticated users to manage thread likes" ON forum_thread_likes;
CREATE POLICY "Allow authenticated users to manage thread likes" ON forum_thread_likes FOR ALL 
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow authenticated users to manage post likes" ON forum_post_likes;
CREATE POLICY "Allow authenticated users to manage post likes" ON forum_post_likes FOR ALL 
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create views with stats
CREATE OR REPLACE VIEW forum_categories_with_stats AS
SELECT 
    c.*,
    COUNT(t.id) AS threads_count,
    COALESCE(SUM(t.replies_count), 0) AS posts_count,
    MAX(t.created_at) AS last_thread_at
FROM forum_categories c
LEFT JOIN forum_threads t ON c.id = t.category_id
GROUP BY c.id, c.name, c.description, c.icon, c.color, c.created_at, c.updated_at;

-- Create threads with details view
CREATE OR REPLACE VIEW forum_threads_with_details AS
SELECT 
    t.*,
    c.name AS category_name,
    c.color AS category_color,
    c.icon AS category_icon,
    u.username AS author_username,
    u.avatar_url AS author_avatar_url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM forum_thread_likes tl WHERE tl.thread_id = t.id AND tl.user_id = auth.uid()) 
        THEN true 
        ELSE false 
    END AS is_liked,
    COALESCE(last_u.username, '') AS last_post_username,
    last_u.avatar_url AS last_post_avatar_url,
    GREATEST(t.replies_count, 0) AS participant_count,
    -- Simple hot score calculation
    (t.likes_count * 2 + t.views_count * 0.1 + t.replies_count * 1.5) AS hot_score
FROM forum_threads t
LEFT JOIN forum_categories c ON t.category_id = c.id
LEFT JOIN user_profiles u ON t.author_id = u.id
LEFT JOIN user_profiles last_u ON t.last_post_user_id = last_u.id;

-- Create posts with details view
CREATE OR REPLACE VIEW forum_posts_with_details AS
SELECT 
    p.*,
    t.title AS thread_title,
    u.username AS author_username,
    u.avatar_url AS author_avatar_url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM forum_post_likes pl WHERE pl.post_id = p.id AND pl.user_id = auth.uid()) 
        THEN true 
        ELSE false 
    END AS is_liked,
    t.is_locked AS is_thread_locked,
    t.category_id
FROM forum_posts p
LEFT JOIN forum_threads t ON p.thread_id = t.id
LEFT JOIN user_profiles u ON p.author_id = u.id;

-- Create necessary RPC functions
CREATE OR REPLACE FUNCTION get_thread_posts(
    p_thread_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    thread_id UUID,
    thread_title TEXT,
    content TEXT,
    author_id UUID,
    author_username TEXT,
    author_avatar_url TEXT,
    likes_count INTEGER,
    is_liked BOOLEAN,
    parent_post_id UUID,
    replies_count INTEGER,
    depth INTEGER,
    is_thread_locked BOOLEAN,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.thread_id,
        p.thread_title,
        p.content,
        p.author_id,
        p.author_username,
        p.author_avatar_url,
        p.likes_count,
        p.is_liked,
        p.parent_post_id,
        p.replies_count,
        p.depth,
        p.is_thread_locked,
        p.category_id,
        p.created_at,
        p.updated_at
    FROM forum_posts_with_details p
    WHERE p.thread_id = p_thread_id
    ORDER BY p.created_at ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Create category threads function
CREATE OR REPLACE FUNCTION get_category_threads(
    p_category_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    category_icon TEXT,
    title TEXT,
    content TEXT,
    author_id UUID,
    author_username TEXT,
    author_avatar_url TEXT,
    is_pinned BOOLEAN,
    is_locked BOOLEAN,
    views_count INTEGER,
    replies_count INTEGER,
    likes_count INTEGER,
    is_liked BOOLEAN,
    last_post_at TIMESTAMP WITH TIME ZONE,
    last_post_user_id UUID,
    last_post_username TEXT,
    last_post_avatar_url TEXT,
    participant_count INTEGER,
    hot_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.category_id,
        t.category_name,
        t.category_color,
        t.category_icon,
        t.title,
        t.content,
        t.author_id,
        t.author_username,
        t.author_avatar_url,
        t.is_pinned,
        t.is_locked,
        t.views_count,
        t.replies_count,
        t.likes_count,
        t.is_liked,
        t.last_post_at,
        t.last_post_user_id,
        t.last_post_username,
        t.last_post_avatar_url,
        t.participant_count,
        t.hot_score,
        t.created_at,
        t.updated_at
    FROM forum_threads_with_details t
    WHERE t.category_id = p_category_id
    ORDER BY t.is_pinned DESC, t.updated_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Create increment views function
CREATE OR REPLACE FUNCTION increment_thread_views(thread_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    UPDATE forum_threads 
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = thread_uuid;
END;
$$;

-- Insert sample data
INSERT INTO forum_categories (id, name, description, icon, color) VALUES
('7b357534-c20b-4bdb-9df6-578442d07850', 'General Discussion', 'General gaming discussions and community chat', '💬', 'blue')
ON CONFLICT (id) DO NOTHING;

-- Insert sample thread
INSERT INTO forum_threads (id, category_id, title, content, author_id, views_count, replies_count) VALUES
('fd5ed759-7a8c-4369-b351-5d06e7f98fd6', '7b357534-c20b-4bdb-9df6-578442d07850', 'Forum', 'Hello', 
    (SELECT id FROM auth.users LIMIT 1), 0, 0)
ON CONFLICT (id) DO NOTHING;