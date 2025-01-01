-- Create an enum type for roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop the role column if it exists (to avoid casting issues)
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role;

-- Add role column with the correct type
ALTER TABLE profiles 
ADD COLUMN role user_role NOT NULL DEFAULT 'user'::user_role;

-- Set initial admin (replace with your user_id)
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE id = 'fd974268-faea-418f-93f2-66d2950ca9ee'; 