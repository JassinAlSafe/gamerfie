-- Drop existing foreign key if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_challenges_creator'
    ) THEN
        ALTER TABLE challenges DROP CONSTRAINT fk_challenges_creator;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_challenge_participants_user'
    ) THEN
        ALTER TABLE challenge_participants DROP CONSTRAINT fk_challenge_participants_user;
    END IF;
END $$;

-- Add foreign key constraint for creator_id
ALTER TABLE challenges
ADD CONSTRAINT fk_challenges_creator
FOREIGN KEY (creator_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Add foreign key constraint for challenge_participants.user_id
ALTER TABLE challenge_participants
ADD CONSTRAINT fk_challenge_participants_user
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Ensure RLS policies are updated
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Creators can update their challenges" ON challenges;

CREATE POLICY "Challenges are viewable by everyone"
ON challenges FOR SELECT
USING (true);

CREATE POLICY "Users can create challenges"
ON challenges FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges"
ON challenges FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Add RLS policies for challenge_participants
DROP POLICY IF EXISTS "Challenge participants are viewable by everyone" ON challenge_participants;
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;

CREATE POLICY "Challenge participants are viewable by everyone"
ON challenge_participants FOR SELECT
USING (true);

CREATE POLICY "Users can join challenges"
ON challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Refresh schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 