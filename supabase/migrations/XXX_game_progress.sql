-- Check if enum exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
        CREATE TYPE game_status AS ENUM ('notStarted', 'inProgress', 'completed', 'abandoned');
    END IF;
END $$;

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'status') THEN
        ALTER TABLE user_games ADD COLUMN status game_status DEFAULT 'notStarted';
    END IF;

    -- Play time column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'play_time') THEN
        ALTER TABLE user_games ADD COLUMN play_time float DEFAULT 0;
    END IF;

    -- User rating column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'user_rating') THEN
        ALTER TABLE user_games ADD COLUMN user_rating float;
    END IF;

    -- Completed at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'completed_at') THEN
        ALTER TABLE user_games ADD COLUMN completed_at timestamp with time zone;
    END IF;

    -- Notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'notes') THEN
        ALTER TABLE user_games ADD COLUMN notes text;
    END IF;

    -- Last played at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_games' AND column_name = 'last_played_at') THEN
        ALTER TABLE user_games ADD COLUMN last_played_at timestamp with time zone;
    END IF;
END $$; 