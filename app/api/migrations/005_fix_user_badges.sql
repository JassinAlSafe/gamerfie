-- Drop existing table if it exists
DROP TABLE IF EXISTS user_badges CASCADE;

-- Create user_badges table with proper foreign key relationships
CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_from_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own badges"
  ON user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON user_badges
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_challenge_id ON user_badges(awarded_from_challenge_id);

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 