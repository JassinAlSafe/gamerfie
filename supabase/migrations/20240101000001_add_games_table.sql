-- Drop existing table if it exists
DROP TABLE IF EXISTS games CASCADE;

-- Create games table
CREATE TABLE games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    name TEXT NOT NULL,
    cover_url TEXT,
    rating FLOAT,
    total_rating_count INTEGER,
    first_release_date BIGINT,
    summary TEXT,
    storyline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Add RLS policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own games
CREATE POLICY "Users can view their own games"
    ON games FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own games
CREATE POLICY "Users can insert their own games"
    ON games FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own games
CREATE POLICY "Users can update their own games"
    ON games FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own games
CREATE POLICY "Users can delete their own games"
    ON games FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX games_user_id_idx ON games(user_id);
CREATE INDEX games_game_id_idx ON games(game_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 