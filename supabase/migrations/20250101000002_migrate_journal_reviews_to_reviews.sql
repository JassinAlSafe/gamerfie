-- Migrate existing reviews from journal_entries to the new reviews table
-- This migration preserves all existing review data

-- 1. First, ensure we have the latest data
-- Insert all existing reviews from journal_entries into reviews table
INSERT INTO reviews (
  id,
  user_id,
  game_id,
  rating,
  review_text,
  is_public,
  created_at,
  updated_at
)
SELECT 
  id,                    -- Keep the same ID to maintain referential integrity
  user_id,
  game_id,
  rating,
  content AS review_text,
  COALESCE(is_public, true) AS is_public,
  created_at,
  updated_at
FROM journal_entries 
WHERE type = 'review'
  AND rating IS NOT NULL  -- Only migrate entries that have ratings
  AND game_id IS NOT NULL -- Only migrate entries that have game_id
ON CONFLICT (user_id, game_id) DO UPDATE SET
  -- If there's a conflict (duplicate user+game), update with the latest data
  rating = EXCLUDED.rating,
  review_text = EXCLUDED.review_text,
  is_public = EXCLUDED.is_public,
  updated_at = EXCLUDED.updated_at;

-- 2. Verify the migration worked
-- Log the migration results
DO $$
DECLARE
  journal_count INTEGER;
  reviews_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO journal_count 
  FROM journal_entries 
  WHERE type = 'review' AND rating IS NOT NULL AND game_id IS NOT NULL;
  
  SELECT COUNT(*) INTO reviews_count 
  FROM reviews;
  
  RAISE NOTICE 'Migration completed: % reviews migrated from journal_entries to reviews table', journal_count;
  RAISE NOTICE 'Total reviews in new table: %', reviews_count;
END $$;

-- 3. Create a backup view of journal reviews (optional - for safety)
CREATE OR REPLACE VIEW journal_reviews_backup AS
SELECT 
  id,
  user_id,
  game_id,
  rating,
  content AS review_text,
  is_public,
  created_at,
  updated_at,
  'journal_entry' AS source
FROM journal_entries
WHERE type = 'review';

-- Add a comment to document the migration
COMMENT ON TABLE reviews IS 'Dedicated reviews table created during migration from journal_entries. Migrated on ' || NOW(); 