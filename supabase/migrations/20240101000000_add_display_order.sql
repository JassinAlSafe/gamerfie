-- Add display_order column to user_games table
ALTER TABLE user_games 
ADD COLUMN IF NOT EXISTS display_order integer;

-- Set default values based on creation order
UPDATE user_games 
SET display_order = t.rn 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn 
  FROM user_games
) t 
WHERE user_games.id = t.id;

-- Make display_order not null after setting defaults
ALTER TABLE user_games 
ALTER COLUMN display_order SET NOT NULL; 