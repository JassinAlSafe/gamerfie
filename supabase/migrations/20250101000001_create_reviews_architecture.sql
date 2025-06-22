-- Create Reviews Architecture Migration
-- This migration creates a proper review system with dedicated tables

-- 1. Create a dedicated reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  playtime_at_review INTEGER, -- hours played when review was written
  is_recommended BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id) -- One review per user per game
);

-- 2. Create review_likes table with proper foreign key
CREATE TABLE IF NOT EXISTS review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One like per user per review
);

-- 3. Create review_bookmarks table with proper foreign key
CREATE TABLE IF NOT EXISTS review_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One bookmark per user per review
);

-- 4. Create review_comments table for future use
CREATE TABLE IF NOT EXISTS review_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_review_bookmarks_review_id ON review_bookmarks(review_id);
CREATE INDEX IF NOT EXISTS idx_review_bookmarks_user_id ON review_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON review_comments(user_id);

-- 6. Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for reviews
CREATE POLICY "Public reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reviews (public or private)" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS Policies for review_likes
CREATE POLICY "Review likes are viewable by everyone" ON review_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS Policies for review_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON review_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON review_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON review_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS Policies for review_comments
CREATE POLICY "Comments on public reviews are viewable by everyone" ON review_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews r 
      WHERE r.id = review_comments.review_id 
      AND r.is_public = true
    )
  );

CREATE POLICY "Users can view comments on their own reviews" ON review_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews r 
      WHERE r.id = review_comments.review_id 
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on public reviews" ON review_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM reviews r 
      WHERE r.id = review_comments.review_id 
      AND r.is_public = true
    )
  );

CREATE POLICY "Users can update their own comments" ON review_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON review_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_comments_updated_at
    BEFORE UPDATE ON review_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 13. Create view for review stats (optional but useful)
CREATE OR REPLACE VIEW review_stats AS
SELECT 
  r.id,
  r.user_id,
  r.game_id,
  r.rating,
  r.created_at,
  COUNT(DISTINCT rl.id) AS likes_count,
  COUNT(DISTINCT rb.id) AS bookmarks_count,
  COUNT(DISTINCT rc.id) AS comments_count
FROM reviews r
LEFT JOIN review_likes rl ON r.id = rl.review_id
LEFT JOIN review_bookmarks rb ON r.id = rb.review_id
LEFT JOIN review_comments rc ON r.id = rc.review_id
GROUP BY r.id, r.user_id, r.game_id, r.rating, r.created_at; 