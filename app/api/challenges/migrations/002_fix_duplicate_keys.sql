-- Drop the duplicate foreign key
ALTER TABLE challenge_goals
DROP CONSTRAINT IF EXISTS challenge_goals_challenge_id_fkey;

-- Keep only our explicitly named constraint
ALTER TABLE challenge_goals
DROP CONSTRAINT IF EXISTS fk_challenge_goals_challenges; 