-- Add requirements column to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT NULL;

-- Update existing challenges to have empty requirements if needed
UPDATE challenges
SET requirements = '{}'::jsonb
WHERE requirements IS NULL; 