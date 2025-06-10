-- Fix activity schema issues
-- This migration addresses the following issues:
-- 1. Missing 'type' column in activity_reactions table
-- 2. Missing foreign key constraints for proper relationships

-- Add missing type column to activity_reactions table if it doesn't exist
DO $$
BEGIN
    -- Check if the type column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_reactions' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE activity_reactions ADD COLUMN type TEXT DEFAULT 'emoji';
        
        -- Update existing records to have a default type
        UPDATE activity_reactions SET type = 'emoji' WHERE type IS NULL;
    END IF;
END $$;

-- Fix foreign key constraints and ensure proper relationships

-- Add foreign key constraint for friend_activities -> profiles if it doesn't exist
DO $$
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_activities_user_id_fkey' 
        AND table_name = 'friend_activities'
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE friend_activities 
        ADD CONSTRAINT friend_activities_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure activity_reactions has proper foreign key to profiles
DO $$
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_reactions_user_id_fkey' 
        AND table_name = 'activity_reactions'
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE activity_reactions 
        ADD CONSTRAINT activity_reactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure activity_comments has proper foreign key to profiles
DO $$
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_comments_user_id_fkey' 
        AND table_name = 'activity_comments'
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE activity_comments 
        ADD CONSTRAINT activity_comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$; 