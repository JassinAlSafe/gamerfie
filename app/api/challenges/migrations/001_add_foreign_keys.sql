-- Add foreign key constraints for creator_id
ALTER TABLE challenges
ADD CONSTRAINT fk_challenges_creator
  FOREIGN KEY (creator_id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE;

-- Add foreign key for challenge_participants to profiles
ALTER TABLE challenge_participants
ADD CONSTRAINT fk_challenge_participants_profiles
  FOREIGN KEY (user_id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE;

-- Add foreign key for challenge_teams to challenges
ALTER TABLE challenge_teams
ADD CONSTRAINT fk_challenge_teams_challenges
  FOREIGN KEY (challenge_id)
  REFERENCES challenges (id)
  ON DELETE CASCADE;

-- Add foreign key for challenge_participants to teams
ALTER TABLE challenge_participants
ADD CONSTRAINT fk_challenge_participants_teams
  FOREIGN KEY (team_id)
  REFERENCES challenge_teams (id)
  ON DELETE SET NULL;

-- Add foreign key for challenge_goals to challenges
ALTER TABLE challenge_goals
ADD CONSTRAINT fk_challenge_goals_challenges
  FOREIGN KEY (challenge_id)
  REFERENCES challenges (id)
  ON DELETE CASCADE;

-- Add foreign key for challenge_rewards to challenges
ALTER TABLE challenge_rewards
ADD CONSTRAINT fk_challenge_rewards_challenges
  FOREIGN KEY (challenge_id)
  REFERENCES challenges (id)
  ON DELETE CASCADE;

-- Add foreign key for challenge_rules to challenges
ALTER TABLE challenge_rules
ADD CONSTRAINT fk_challenge_rules_challenges
  FOREIGN KEY (challenge_id)
  REFERENCES challenges (id)
  ON DELETE CASCADE; 