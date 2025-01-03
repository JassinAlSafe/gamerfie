-- Drop existing table
DROP TABLE IF EXISTS challenge_participants CASCADE;

-- Recreate challenge participants table with correct schema
CREATE TABLE challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Add RLS policies
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Users can view challenge participants"
    ON challenge_participants FOR SELECT
    USING (true);

-- Allow users to join challenges
CREATE POLICY "Users can join challenges"
    ON challenge_participants FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    ));

-- Allow users to update their own progress
CREATE POLICY "Users can update their own progress"
    ON challenge_participants FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    ));

-- Allow users to leave challenges
CREATE POLICY "Users can leave challenges"
    ON challenge_participants FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    )); 