-- Drop existing foreign keys if they exist
DO $$ 
BEGIN
  -- Drop existing foreign keys with any possible name
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_challenge_id_fkey;
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_user_id_fkey;
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_team_id_fkey;
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS fk_challenge_participants_challenge;
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS fk_challenge_participants_user;
  ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS fk_challenge_participants_team;
  
  ALTER TABLE challenge_goals DROP CONSTRAINT IF EXISTS challenge_goals_challenge_id_fkey;
  ALTER TABLE challenge_goals DROP CONSTRAINT IF EXISTS fk_challenge_goals_challenge;
  
  ALTER TABLE challenge_teams DROP CONSTRAINT IF EXISTS challenge_teams_challenge_id_fkey;
  ALTER TABLE challenge_teams DROP CONSTRAINT IF EXISTS fk_challenge_teams_challenge;
  
  ALTER TABLE challenge_rewards DROP CONSTRAINT IF EXISTS challenge_rewards_challenge_id_fkey;
  ALTER TABLE challenge_rewards DROP CONSTRAINT IF EXISTS fk_challenge_rewards_challenge;
  
  ALTER TABLE challenge_rules DROP CONSTRAINT IF EXISTS challenge_rules_challenge_id_fkey;
  ALTER TABLE challenge_rules DROP CONSTRAINT IF EXISTS fk_challenge_rules_challenge;
  
  ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_creator_id_fkey;
  ALTER TABLE challenges DROP CONSTRAINT IF EXISTS fk_challenges_creator;
END $$;

-- Add foreign key constraints with explicit names
ALTER TABLE challenges
  ADD CONSTRAINT fk_challenges_creator
  FOREIGN KEY (creator_id)
  REFERENCES profiles(id)
  ON DELETE SET NULL;

ALTER TABLE challenge_participants
  ADD CONSTRAINT fk_challenge_participants_challenge
  FOREIGN KEY (challenge_id)
  REFERENCES challenges(id)
  ON DELETE CASCADE;

ALTER TABLE challenge_participants
  ADD CONSTRAINT fk_challenge_participants_user
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE challenge_participants
  ADD CONSTRAINT fk_challenge_participants_team
  FOREIGN KEY (team_id)
  REFERENCES challenge_teams(id)
  ON DELETE SET NULL;

ALTER TABLE challenge_goals
  ADD CONSTRAINT fk_challenge_goals_challenge
  FOREIGN KEY (challenge_id)
  REFERENCES challenges(id)
  ON DELETE CASCADE;

ALTER TABLE challenge_teams
  ADD CONSTRAINT fk_challenge_teams_challenge
  FOREIGN KEY (challenge_id)
  REFERENCES challenges(id)
  ON DELETE CASCADE;

ALTER TABLE challenge_rewards
  ADD CONSTRAINT fk_challenge_rewards_challenge
  FOREIGN KEY (challenge_id)
  REFERENCES challenges(id)
  ON DELETE CASCADE;

ALTER TABLE challenge_rules
  ADD CONSTRAINT fk_challenge_rules_challenge
  FOREIGN KEY (challenge_id)
  REFERENCES challenges(id)
  ON DELETE CASCADE; 