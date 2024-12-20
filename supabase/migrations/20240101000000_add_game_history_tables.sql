-- Create game progress history table
CREATE TABLE IF NOT EXISTS game_progress_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  play_time INTEGER,
  completion_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT fk_user_game
    FOREIGN KEY (user_id, game_id)
    REFERENCES user_games(user_id, game_id)
    ON DELETE CASCADE
);

-- Create game achievement history table
CREATE TABLE IF NOT EXISTS game_achievement_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  achievements_completed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT fk_user_game
    FOREIGN KEY (user_id, game_id)
    REFERENCES user_games(user_id, game_id)
    ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE game_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_achievement_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own progress history
CREATE POLICY "Users can view their own progress history"
  ON game_progress_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own progress history
CREATE POLICY "Users can insert their own progress history"
  ON game_progress_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own achievement history
CREATE POLICY "Users can view their own achievement history"
  ON game_achievement_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own achievement history
CREATE POLICY "Users can insert their own achievement history"
  ON game_achievement_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_progress_history_user_game 
  ON game_progress_history(user_id, game_id);
CREATE INDEX idx_progress_history_created_at 
  ON game_progress_history(created_at);

CREATE INDEX idx_achievement_history_user_game 
  ON game_achievement_history(user_id, game_id);
CREATE INDEX idx_achievement_history_created_at 
  ON game_achievement_history(created_at); 