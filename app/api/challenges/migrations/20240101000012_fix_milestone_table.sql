-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Milestones are viewable by challenge participants" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are insertable by challenge creators" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are updatable by their creators" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are deletable by their creators" ON progress_milestones;

-- Drop existing table if it exists
DROP TABLE IF EXISTS progress_milestones CASCADE;

-- Create the table with all required columns
CREATE TABLE progress_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required_progress INTEGER NOT NULL CHECK (required_progress >= 0 AND required_progress <= 100),
    reward_type TEXT CHECK (reward_type IN ('badge', 'points', 'title')),
    reward_amount INTEGER,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_milestone_timestamp ON progress_milestones;
CREATE TRIGGER update_milestone_timestamp
  BEFORE UPDATE ON progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_timestamp();

-- Enable RLS on the table
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Milestones are viewable by challenge participants"
ON progress_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM challenges c
    LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
    WHERE c.id = progress_milestones.challenge_id
    AND (cp.user_id = auth.uid() OR c.creator_id = auth.uid())
  )
);

CREATE POLICY "Milestones are insertable by challenge creators"
ON progress_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM challenges
    WHERE id = progress_milestones.challenge_id
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "Milestones are updatable by their creators"
ON progress_milestones FOR UPDATE
USING (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM challenges
    WHERE id = progress_milestones.challenge_id
    AND creator_id = auth.uid()
  )
)
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM challenges
    WHERE id = progress_milestones.challenge_id
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "Milestones are deletable by their creators"
ON progress_milestones FOR DELETE
USING (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM challenges
    WHERE id = progress_milestones.challenge_id
    AND creator_id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT ALL ON progress_milestones TO authenticated;

-- Refresh the schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 