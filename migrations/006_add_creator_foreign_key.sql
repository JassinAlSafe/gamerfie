-- Drop the existing foreign key if it exists (using a different name)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'challenges_creator_id_fkey'
        AND table_name = 'challenges'
    ) THEN
        ALTER TABLE challenges DROP CONSTRAINT challenges_creator_id_fkey;
    END IF;
END $$;

-- Add the foreign key with the exact name PostgREST is looking for
ALTER TABLE challenges
ADD CONSTRAINT challenges_creator_id_fkey
FOREIGN KEY (creator_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Verify the foreign key exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'challenges_creator_id_fkey'
        AND table_name = 'challenges'
    ) THEN
        RAISE EXCEPTION 'Foreign key challenges_creator_id_fkey was not created successfully';
    END IF;
END $$; 