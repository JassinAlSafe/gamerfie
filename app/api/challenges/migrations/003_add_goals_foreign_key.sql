-- Add the foreign key constraint for challenge_goals
ALTER TABLE challenge_goals
ADD CONSTRAINT fk_challenge_goals_challenges
  FOREIGN KEY (challenge_id)
  REFERENCES challenges (id)
  ON DELETE CASCADE; 