-- First, drop everything in reverse dependency order
DO $$ 
BEGIN
    -- Drop triggers if the table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'challenge_participant_progress') THEN
        DROP TRIGGER IF EXISTS record_progress_history_trigger ON challenge_participant_progress;
        DROP TRIGGER IF EXISTS update_team_progress_trigger ON challenge_participant_progress;
        DROP TRIGGER IF EXISTS update_participant_progress_trigger ON challenge_participant_progress;
    END IF;
    
    -- Drop functions
    DROP FUNCTION IF EXISTS record_progress_history();
    DROP FUNCTION IF EXISTS update_team_progress();
    DROP FUNCTION IF EXISTS update_participant_progress();
    
    -- Drop dependent tables first
    DROP TABLE IF EXISTS claimed_rewards CASCADE;
    
    -- Drop challenge tables in reverse dependency order
    DROP TABLE IF EXISTS challenge_progress_history CASCADE;
    DROP TABLE IF EXISTS challenge_participant_progress CASCADE;
    DROP TABLE IF EXISTS challenge_team_progress CASCADE;
    DROP TABLE IF EXISTS challenge_rewards CASCADE;
    DROP TABLE IF EXISTS challenge_rules CASCADE;
    DROP TABLE IF EXISTS challenge_participants CASCADE;
    DROP TABLE IF EXISTS challenge_teams CASCADE;
    DROP TABLE IF EXISTS challenge_goals CASCADE;
    DROP TABLE IF EXISTS challenges CASCADE;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('competitive', 'collaborative')),
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  min_participants INTEGER NOT NULL DEFAULT 2,
  max_participants INTEGER,
  creator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;

-- Create challenge goals table
CREATE TABLE challenge_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenge_goals DISABLE ROW LEVEL SECURITY;

-- Create challenge teams table
CREATE TABLE challenge_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenge_teams DISABLE ROW LEVEL SECURITY;

-- Create challenge participants table
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES challenge_teams(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE challenge_participants DISABLE ROW LEVEL SECURITY;

-- Create team progress table
CREATE TABLE challenge_team_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, goal_id)
);
ALTER TABLE challenge_team_progress DISABLE ROW LEVEL SECURITY;

-- Create participant progress table
CREATE TABLE challenge_participant_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES challenge_participants(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, goal_id)
);
ALTER TABLE challenge_participant_progress DISABLE ROW LEVEL SECURITY;

-- Create rewards table
CREATE TABLE challenge_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('badge', 'points', 'title')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenge_rewards DISABLE ROW LEVEL SECURITY;

-- Create rules table
CREATE TABLE challenge_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenge_rules DISABLE ROW LEVEL SECURITY;

-- Create progress history table
CREATE TABLE challenge_progress_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES challenge_participants(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL,
  milestone TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenge_progress_history DISABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenge_goals_challenge ON challenge_goals(challenge_id);
CREATE INDEX idx_challenge_teams_challenge ON challenge_teams(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_team ON challenge_participants(team_id);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_participant_progress_participant ON challenge_participant_progress(participant_id);
CREATE INDEX idx_participant_progress_goal ON challenge_participant_progress(goal_id);
CREATE INDEX idx_team_progress_team ON challenge_team_progress(team_id);
CREATE INDEX idx_team_progress_goal ON challenge_team_progress(goal_id);
CREATE INDEX idx_progress_history_participant ON challenge_progress_history(participant_id);
CREATE INDEX idx_progress_history_timestamp ON challenge_progress_history(timestamp);

-- Create function to update participant progress
CREATE OR REPLACE FUNCTION update_participant_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the overall progress in challenge_participants
  UPDATE challenge_participants cp
  SET progress = (
    SELECT AVG(progress)
    FROM challenge_participant_progress
    WHERE participant_id = cp.id
  )
  WHERE id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update team progress
CREATE OR REPLACE FUNCTION update_team_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the team progress based on participant progress
  UPDATE challenge_team_progress ctp
  SET progress = (
    SELECT AVG(cpp.progress)
    FROM challenge_participant_progress cpp
    JOIN challenge_participants cp ON cp.id = cpp.participant_id
    WHERE cp.team_id = NEW.team_id
    AND cpp.goal_id = ctp.goal_id
  )
  WHERE team_id = NEW.team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create progress history function
CREATE OR REPLACE FUNCTION record_progress_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Record progress change in history
  INSERT INTO challenge_progress_history (
    challenge_id,
    participant_id,
    goal_id,
    progress,
    milestone
  )
  VALUES (
    NEW.challenge_id,
    NEW.participant_id,
    NEW.goal_id,
    NEW.progress,
    CASE
      WHEN NEW.progress >= 100 THEN 'completed'
      WHEN NEW.progress >= 75 THEN '75_percent'
      WHEN NEW.progress >= 50 THEN '50_percent'
      WHEN NEW.progress >= 25 THEN '25_percent'
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers after functions are created
CREATE TRIGGER update_participant_progress_trigger
AFTER INSERT OR UPDATE ON challenge_participant_progress
FOR EACH ROW
EXECUTE FUNCTION update_participant_progress();

CREATE TRIGGER update_team_progress_trigger
AFTER INSERT OR UPDATE ON challenge_participant_progress
FOR EACH ROW
EXECUTE FUNCTION update_team_progress();

CREATE TRIGGER record_progress_history_trigger
AFTER INSERT OR UPDATE ON challenge_participant_progress
FOR EACH ROW
EXECUTE FUNCTION record_progress_history(); 