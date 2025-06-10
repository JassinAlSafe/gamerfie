-- Fix user_games table by adding missing columns and fixing RLS policies

-- Add completion_percentage column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_games' AND column_name = 'completion_percentage'
    ) THEN
        ALTER TABLE user_games ADD COLUMN completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
    END IF;
END $$;

-- Add achievements_completed column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_games' AND column_name = 'achievements_completed'
    ) THEN
        ALTER TABLE user_games ADD COLUMN achievements_completed INTEGER DEFAULT 0 CHECK (achievements_completed >= 0);
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own games" ON user_games;
DROP POLICY IF EXISTS "Users can view all user_games" ON user_games;
DROP POLICY IF EXISTS "Users can insert their own games" ON user_games;
DROP POLICY IF EXISTS "Users can update their own games" ON user_games;
DROP POLICY IF EXISTS "Users can delete their own games" ON user_games;

-- Create new policies that are more permissive for reading but secure for writing
CREATE POLICY "Authenticated users can view user_games"
  ON user_games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own games"
  ON user_games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON user_games FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON user_games FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_games_completion ON user_games(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_user_games_achievements ON user_games(achievements_completed);

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 