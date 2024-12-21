-- Create enum for game status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
        CREATE TYPE game_status AS ENUM ('playing', 'completed', 'want_to_play', 'dropped');
    END IF;
END $$;

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id text PRIMARY KEY,
  name text NOT NULL,
  cover_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_games table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_games (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text REFERENCES public.games(id) ON DELETE CASCADE,
  status game_status DEFAULT 'want_to_play',
  play_time float DEFAULT 0,
  user_rating float,
  completed_at timestamp with time zone,
  notes text,
  last_played_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, game_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(game_id);
CREATE INDEX IF NOT EXISTS idx_user_games_status ON user_games(status); 

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Games table policies
CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Games can be inserted by authenticated users"
  ON public.games FOR INSERT
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