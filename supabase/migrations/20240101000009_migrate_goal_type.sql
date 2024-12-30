-- Create the new enum type first
CREATE TYPE challenge_goal_type_new AS ENUM (
  'complete_games',
  'achieve_trophies',
  'play_time',
  'review_games',
  'score_points',
  'reach_level'
);

-- Create a temporary column with the new type
ALTER TABLE challenges 
ADD COLUMN goal_type_new challenge_goal_type_new;

-- Copy data to the new column, converting values as needed
UPDATE challenges
SET goal_type_new = CASE goal_type
  WHEN 'complete_games' THEN 'complete_games'::challenge_goal_type_new
  WHEN 'play_time' THEN 'play_time'::challenge_goal_type_new
  WHEN 'review_games' THEN 'review_games'::challenge_goal_type_new
  ELSE 'complete_games'::challenge_goal_type_new -- Default value for any unmatched types
END;

-- Drop the old column and rename the new one
ALTER TABLE challenges 
DROP COLUMN goal_type;

ALTER TABLE challenges 
ALTER COLUMN goal_type_new SET NOT NULL;

ALTER TABLE challenges 
RENAME COLUMN goal_type_new TO goal_type;

-- Drop the old type if it exists
DROP TYPE IF EXISTS challenge_goal_type; 