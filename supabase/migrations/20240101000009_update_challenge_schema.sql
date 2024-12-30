-- Update challenge_status enum to include 'cancelled'
ALTER TYPE challenge_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_progress ON challenge_participants(progress);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed ON challenge_participants(completed);

-- Add missing columns if they don't exist
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS game_requirements JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS reward_distribution TEXT CHECK (reward_distribution IN ('individual', 'team', 'top_performers')) DEFAULT 'individual';

-- Add constraints for better data integrity
ALTER TABLE challenges
ADD CONSTRAINT valid_dates CHECK (end_date > start_date),
ADD CONSTRAINT valid_participants CHECK (
    (min_participants IS NULL AND max_participants IS NULL) OR
    (min_participants IS NULL AND max_participants > 0) OR
    (max_participants IS NULL AND min_participants > 0) OR
    (min_participants > 0 AND max_participants >= min_participants)
);

-- Add trigger for automatic status updates
CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on dates
    IF NEW.start_date > CURRENT_TIMESTAMP THEN
        NEW.status = 'upcoming';
    ELSIF NEW.end_date < CURRENT_TIMESTAMP THEN
        NEW.status = 'completed';
    ELSE
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS update_challenge_status_trigger ON challenges;
CREATE TRIGGER update_challenge_status_trigger
    BEFORE INSERT OR UPDATE OF start_date, end_date
    ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_status();

-- Add function to check if a user can leave a challenge
CREATE OR REPLACE FUNCTION can_leave_challenge(challenge_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    challenge_status TEXT;
    participant_count INTEGER;
    is_creator BOOLEAN;
BEGIN
    -- Get challenge status and check if user is creator
    SELECT c.status, c.creator_id = user_id
    INTO challenge_status, is_creator
    FROM challenges c
    WHERE c.id = challenge_id;

    -- Get number of participants
    SELECT COUNT(*)
    INTO participant_count
    FROM challenge_participants
    WHERE challenge_id = challenge_id;

    -- Cannot leave if:
    -- 1. Challenge is active
    -- 2. User is the creator
    -- 3. User is the only participant
    RETURN challenge_status != 'active' 
           AND NOT is_creator 
           AND participant_count > 1;
END;
$$ LANGUAGE plpgsql;

-- Add policy for leaving challenges
DROP POLICY IF EXISTS "Users can leave challenges" ON challenge_participants;
CREATE POLICY "Users can leave challenges"
    ON challenge_participants FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE id = user_id
        )
        AND
        can_leave_challenge(challenge_id, user_id)
    ); 