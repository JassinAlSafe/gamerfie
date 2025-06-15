-- Create news_posts table
CREATE TABLE news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category TEXT NOT NULL CHECK (category IN ('Product Update', 'Feature', 'Announcement', 'Security', 'Community')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    badge TEXT, -- Optional badge like "Latest", "Important", etc.
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_news_posts_status ON news_posts(status);
CREATE INDEX idx_news_posts_category ON news_posts(category);
CREATE INDEX idx_news_posts_published_at ON news_posts(published_at DESC);
CREATE INDEX idx_news_posts_slug ON news_posts(slug);

-- Enable RLS
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

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
CREATE TRIGGER update_news_posts_updated_at
    BEFORE UPDATE ON news_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_news_posts_updated_at();