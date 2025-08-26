-- Fix reviews schema consistency
-- This migration renames unified_reviews to reviews and ensures proper schema alignment

-- 1. First, check if we need to add missing columns to unified_reviews
-- Add any missing columns that exist in the migration but not in unified_reviews
ALTER TABLE unified_reviews 
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN,
  ADD COLUMN IF NOT EXISTS playtime_at_review INTEGER,
  ADD COLUMN IF NOT EXISTS helpfulness_score NUMERIC DEFAULT 0;

-- 2. Ensure proper constraints exist
-- Add rating constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'unified_reviews_rating_check'
  ) THEN
    ALTER TABLE unified_reviews ADD CONSTRAINT unified_reviews_rating_check 
    CHECK (rating >= 1 AND rating <= 10);
  END IF;
END $$;

-- 3. Ensure unique constraint on user_id, game_id exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unified_reviews_user_game_unique'
  ) THEN
    ALTER TABLE unified_reviews ADD CONSTRAINT unified_reviews_user_game_unique 
    UNIQUE(user_id, game_id);
  END IF;
EXCEPTION WHEN others THEN
  -- If constraint fails due to existing duplicates, log it
  RAISE NOTICE 'Could not add unique constraint due to existing duplicates';
END $$;

-- 4. Rename unified_reviews to reviews for consistency
ALTER TABLE unified_reviews RENAME TO reviews;

-- 5. Update any existing indexes to use new table name
-- The indexes will be automatically renamed with the table

-- 6. Update the review_stats view to use the new table name
DROP VIEW IF EXISTS review_stats;
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

-- 7. Ensure all necessary indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- 8. Ensure RLS is enabled and policies exist
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews (public or private)" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Recreate RLS policies
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

-- 9. Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Add comment to document the fix
COMMENT ON TABLE reviews IS 'Reviews table (renamed from unified_reviews for schema consistency). Fixed on ' || NOW();

-- 11. Log the completion
DO $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO review_count FROM reviews;
  RAISE NOTICE 'Schema consistency fix completed. Total reviews: %', review_count;
END $$;