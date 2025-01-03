-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Add creator_id foreign key if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'challenges' 
        AND column_name = 'creator_id'
    ) THEN
        ALTER TABLE challenges ADD COLUMN creator_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update existing challenges to set creator_id if null
UPDATE challenges 
SET creator_id = (SELECT id FROM auth.users LIMIT 1)
WHERE creator_id IS NULL;

-- Make creator_id non-null
ALTER TABLE challenges ALTER COLUMN creator_id SET NOT NULL;

-- Create RLS policies
CREATE POLICY "Challenges are viewable by everyone"
ON challenges FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create challenges"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own challenges"
ON challenges FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS challenges_creator_id_idx ON challenges(creator_id);

-- Refresh schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 