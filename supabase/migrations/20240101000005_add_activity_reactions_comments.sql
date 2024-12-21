-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can add their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can view all comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can add their own comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON activity_comments;

-- Create activity_reactions table
CREATE TABLE IF NOT EXISTS activity_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES friend_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(activity_id, user_id, emoji)
);

-- Create activity_comments table
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES friend_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for activity_reactions
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions"
  ON activity_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON activity_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON activity_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for activity_comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments"
  ON activity_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own comments"
  ON activity_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON activity_comments
  FOR DELETE
  USING (auth.uid() = user_id); 