-- First, create the new enum type with a different name
CREATE TYPE challenge_goal_type_new AS ENUM (
  'complete_games',
  'achieve_trophies',
  'play_time',
  'review_games',
  'score_points',
  'reach_level'
);

-- Add new columns to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS min_participants INTEGER,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create challenge goals table
CREATE TABLE IF NOT EXISTS challenge_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type challenge_goal_type_new NOT NULL,
  target INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge teams table
CREATE TABLE IF NOT EXISTS challenge_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add team_id to challenge_participants
ALTER TABLE challenge_participants
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES challenge_teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create team progress table
CREATE TABLE IF NOT EXISTS challenge_team_progress (
  team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, goal_id)
);

-- Create participant progress table for individual goals
CREATE TABLE IF NOT EXISTS challenge_participant_progress (
  participant_id UUID REFERENCES challenge_participants(user_id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (participant_id, goal_id)
);

-- Add RLS policies
ALTER TABLE challenge_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participant_progress ENABLE ROW LEVEL SECURITY;

-- Challenge goals policies
CREATE POLICY "Challenge goals are viewable by everyone"
  ON challenge_goals FOR SELECT
  USING (true);

CREATE POLICY "Only challenge creators can manage goals"
  ON challenge_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id
      AND creator_id = auth.uid()
    )
  );

-- Challenge teams policies
CREATE POLICY "Challenge teams are viewable by everyone"
  ON challenge_teams FOR SELECT
  USING (true);

CREATE POLICY "Team members can update their team"
  ON challenge_teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE team_id = challenge_teams.id
      AND user_id = auth.uid()
    )
  );

-- Team progress policies
CREATE POLICY "Team progress is viewable by everyone"
  ON challenge_team_progress FOR SELECT
  USING (true);

CREATE POLICY "Team members can update progress"
  ON challenge_team_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE team_id = challenge_team_progress.team_id
      AND user_id = auth.uid()
    )
  );

-- Participant progress policies
CREATE POLICY "Participant progress is viewable by everyone"
  ON challenge_participant_progress FOR SELECT
  USING (true);

CREATE POLICY "Participants can update their own progress"
  ON challenge_participant_progress FOR ALL
  USING (participant_id = auth.uid());

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_challenge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenge_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_updated_at();

-- Function to calculate total progress
CREATE OR REPLACE FUNCTION calculate_challenge_progress(p_challenge_id UUID, p_participant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_progress INTEGER;
  goal_count INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(cpp.progress), 0)::INTEGER,
    COUNT(cg.id)
  INTO total_progress, goal_count
  FROM challenge_goals cg
  LEFT JOIN challenge_participant_progress cpp 
    ON cpp.goal_id = cg.id 
    AND cpp.participant_id = p_participant_id
  WHERE cg.challenge_id = p_challenge_id;

  RETURN CASE 
    WHEN goal_count > 0 THEN total_progress 
    ELSE 0 
  END;
END;
$$ LANGUAGE plpgsql; 