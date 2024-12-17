-- Create game_progress table
CREATE TABLE IF NOT EXISTS game_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    completion INTEGER DEFAULT 0,
    achievements_completed INTEGER DEFAULT 0,
    total_achievements INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    play_time FLOAT DEFAULT 0,
    last_played TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Add RLS policies
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game progress"
    ON game_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game progress"
    ON game_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game progress"
    ON game_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game progress"
    ON game_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX game_progress_user_id_idx ON game_progress(user_id);
CREATE INDEX game_progress_game_id_idx ON game_progress(game_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_progress_updated_at
    BEFORE UPDATE ON game_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 