-- Add new columns for tracking creation and updates
ALTER TABLE progress_milestones
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Milestones are viewable by challenge participants" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are insertable by challenge creators" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are updatable by their creators" ON progress_milestones;
DROP POLICY IF EXISTS "Milestones are deletable by their creators" ON progress_milestones;

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

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_milestone_timestamp ON progress_milestones;
CREATE TRIGGER update_milestone_timestamp
  BEFORE UPDATE ON progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_timestamp(); 