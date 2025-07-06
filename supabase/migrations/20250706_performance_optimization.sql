-- Performance optimization migration
-- Addresses critical performance issues identified in Supabase analysis

-- 1. Add optimized composite indexes for user_games table
-- This addresses the 17,860 slow user_games queries taking 94.17 seconds

-- Index for user game lookups with status filtering and ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_games_user_status_optimized 
ON user_games (user_id, status, last_played_at DESC NULLS LAST) 
WHERE status != 'want_to_play';

-- Index for game-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_games_game_status_optimized
ON user_games (game_id, status)
WHERE status IN ('playing', 'completed');

-- Index for user-specific game lookups (covers the most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_games_user_last_played
ON user_games (user_id, last_played_at DESC NULLS LAST);

-- 2. Add missing description column to games table if it doesn't exist
-- This fixes the "column games.description does not exist" error
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'games' AND column_name = 'description') THEN
        ALTER TABLE games ADD COLUMN description TEXT;
    END IF;
END $$;

-- 3. Update table statistics for better query planning
ANALYZE user_games;
ANALYZE games;
ANALYZE profiles;
ANALYZE friend_activities;

-- 4. Create optimized indexes for realtime performance
-- Index for playlist_games realtime queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlist_games_playlist_order
ON playlist_games (playlist_id, display_order);

-- Index for friend activities (commonly used in realtime)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friend_activities_user_created
ON friend_activities (user_id, created_at DESC);

-- 5. Add indexes for commonly filtered columns
-- Index for published playlists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_published_order
ON playlists (is_published, display_order) 
WHERE is_published = true;

-- Index for playlist type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_playlists_type_published
ON playlists (type, is_published, created_at DESC)
WHERE is_published = true;

-- 6. Remove or consolidate overlapping RLS policies (manual review needed)
-- This comment serves as a reminder to review and consolidate RLS policies
-- Multiple permissive policies on user_games table are causing performance overhead

-- 7. Vacuum and analyze high-traffic tables
-- This should be run regularly, especially user_games which had 45 dead rows
VACUUM ANALYZE user_games;
VACUUM ANALYZE games;
VACUUM ANALYZE playlists;
VACUUM ANALYZE playlist_games;

-- 8. Create partial indexes for common filtering patterns
-- Index for active user games (not dropped)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_games_active
ON user_games (user_id, updated_at DESC)
WHERE status != 'dropped';

-- Index for completed games with ratings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_games_completed_rated
ON user_games (user_id, user_rating DESC)
WHERE status = 'completed' AND user_rating IS NOT NULL;

-- 9. Add comment for maintenance
COMMENT ON INDEX idx_user_games_user_status_optimized IS 'Optimizes user games queries with status filtering - addresses 94.17s of query time';
COMMENT ON INDEX idx_user_games_user_last_played IS 'Primary index for user game library views';