-- Add comments_enabled field to news_posts table
ALTER TABLE news_posts ADD COLUMN comments_enabled BOOLEAN DEFAULT true;

-- Create news_comments table
CREATE TABLE news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES news_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_news_comments_post_id ON news_comments(post_id);
CREATE INDEX idx_news_comments_author_id ON news_comments(author_id);
CREATE INDEX idx_news_comments_created_at ON news_comments(created_at DESC);

-- Enable RLS
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_comments
-- Everyone can read comments on published posts
CREATE POLICY "Comments are viewable on published posts"
    ON news_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM news_posts
            WHERE id = news_comments.post_id
            AND status = 'published'
            AND comments_enabled = true
        )
    );

-- Authenticated users can create comments on published posts with comments enabled
CREATE POLICY "Authenticated users can create comments"
    ON news_comments FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND EXISTS (
            SELECT 1 FROM news_posts
            WHERE id = news_comments.post_id
            AND status = 'published'
            AND comments_enabled = true
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
    ON news_comments FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments, or admins can delete any comment
CREATE POLICY "Users can delete their own comments or admins can delete any"
    ON news_comments FOR DELETE
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Function to automatically update updated_at for comments
CREATE OR REPLACE FUNCTION update_news_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for comments
CREATE TRIGGER update_news_comments_updated_at
    BEFORE UPDATE ON news_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_news_comments_updated_at();