-- Make description field nullable in challenge_goals table
ALTER TABLE challenge_goals ALTER COLUMN description DROP NOT NULL; 