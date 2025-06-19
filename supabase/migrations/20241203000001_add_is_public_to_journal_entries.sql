-- Add is_public column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN journal_entries.is_public IS 'Whether the journal entry is visible to other users (true = public, false = private)';

-- Update existing entries to be public by default (maintains current behavior)
UPDATE journal_entries SET is_public = true WHERE is_public IS NULL;

-- Make the column NOT NULL now that we've set default values
ALTER TABLE journal_entries 
ALTER COLUMN is_public SET NOT NULL; 