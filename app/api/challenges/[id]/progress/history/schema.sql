-- Create progress history table
CREATE TABLE challenge_progress_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL,
  milestone TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_progress_history_challenge_user 
ON challenge_progress_history(challenge_id, user_id);

CREATE INDEX idx_progress_history_timestamp 
ON challenge_progress_history(timestamp);

-- Create function to automatically record progress history
CREATE OR REPLACE FUNCTION record_progress_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Record progress change in history
  INSERT INTO challenge_progress_history (
    challenge_id,
    user_id,
    goal_id,
    progress,
    milestone
  )
  SELECT
    cp.challenge_id,
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
  FROM challenge_participants cp
  WHERE cp.user_id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to record progress history
CREATE TRIGGER record_progress_history_trigger
AFTER INSERT OR UPDATE ON challenge_participant_progress
FOR EACH ROW
EXECUTE FUNCTION record_progress_history(); 