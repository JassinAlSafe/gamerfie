-- Drop existing tables to clean up any inconsistencies
DROP TABLE IF EXISTS user_games CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS game_progress CASCADE;

-- Create enum for game status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
        CREATE TYPE game_status AS ENUM ('playing', 'completed', 'want_to_play', 'dropped');
    END IF;
END $$;

-- Create games table first (parent table)
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cover_url TEXT,
    rating FLOAT,
    total_rating_count INTEGER,
    first_release_date BIGINT,
    platforms JSONB,
    genres JSONB,
    summary TEXT,
    storyline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_games table with proper foreign key relationship
CREATE TABLE user_games (
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
    status game_status DEFAULT 'want_to_play',
    play_time FLOAT DEFAULT 0,
    user_rating FLOAT,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    last_played_at TIMESTAMP WITH TIME ZONE,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(user_id, game_id)
);

-- Create indexes for better performance
CREATE INDEX idx_games_id ON games(id);
CREATE INDEX idx_user_games_user_id ON user_games(user_id);
CREATE INDEX idx_user_games_game_id ON user_games(game_id);
CREATE INDEX idx_user_games_status ON user_games(status);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Games table policies
CREATE POLICY "Games are viewable by everyone"
    ON games FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Games can be inserted by authenticated users"
    ON games FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- User_games table policies
CREATE POLICY "Users can view their own games"
    ON user_games FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
    ON user_games FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
    ON user_games FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
    ON user_games FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_games_updated_at
    BEFORE UPDATE ON user_games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 