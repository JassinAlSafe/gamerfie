-- Create badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table for tracking which users have which badges
CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_from_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- Create challenge_badges table for linking badges to challenges
CREATE TABLE challenge_badges (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (challenge_id, badge_id)
);

-- Add RLS policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_badges ENABLE ROW LEVEL SECURITY;

-- Badges are readable by all authenticated users
CREATE POLICY "badges_read_policy" ON badges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only see their own badge awards
CREATE POLICY "user_badges_read_policy" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Challenge badges are readable by all authenticated users
CREATE POLICY "challenge_badges_read_policy" ON challenge_badges
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow insert/update through our API functions
CREATE POLICY "badges_insert_policy" ON badges
  FOR INSERT WITH CHECK (false);
CREATE POLICY "badges_update_policy" ON badges
  FOR UPDATE USING (false);
CREATE POLICY "user_badges_insert_policy" ON user_badges
  FOR INSERT WITH CHECK (false);
CREATE POLICY "challenge_badges_insert_policy" ON challenge_badges
  FOR INSERT WITH CHECK (false);

-- Create function to award a badge to a user
CREATE OR REPLACE FUNCTION award_badge_to_user(
  p_user_id UUID,
  p_badge_id UUID,
  p_challenge_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user already has this badge
  IF EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) THEN
    RETURN FALSE;
  END IF;

  -- Award the badge
  INSERT INTO user_badges (user_id, badge_id, awarded_from_challenge_id)
  VALUES (p_user_id, p_badge_id, p_challenge_id);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 