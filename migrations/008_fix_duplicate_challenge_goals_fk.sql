-- First, drop both existing foreign keys if they exist
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_challenge_goals_challenge'
        AND table_name = 'challenge_goals'
    ) THEN
        ALTER TABLE challenge_goals DROP CONSTRAINT fk_challenge_goals_challenge;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_challenge_goals_challenges'
        AND table_name = 'challenge_goals'
    ) THEN
        ALTER TABLE challenge_goals DROP CONSTRAINT fk_challenge_goals_challenges;
    END IF;
END $$;

-- Add a single, correctly named foreign key
ALTER TABLE challenge_goals
ADD CONSTRAINT fk_challenge_goals_challenge
FOREIGN KEY (challenge_id)
REFERENCES challenges(id)
ON DELETE CASCADE;

-- Verify only one foreign key exists
DO $$ BEGIN
    IF (
        SELECT COUNT(*)
        FROM information_schema.table_constraints
        WHERE table_name = 'challenge_goals'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE 'fk_challenge_goals_%'
    ) != 1 THEN
        RAISE EXCEPTION 'Expected exactly one foreign key constraint for challenge_goals';
    END IF;
END $$; 