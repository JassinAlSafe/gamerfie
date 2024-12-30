-- ====================================================================================
-- 1) Helper function: List all foreign keys for a table
-- ====================================================================================
CREATE OR REPLACE FUNCTION list_foreign_keys(p_table_name text)
RETURNS TABLE (
    constraint_name text,
    column_name text,
    foreign_table_name text,
    foreign_column_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.constraint_name::text AS constraint_name,
        kcu.column_name::text    AS column_name,
        ccu.table_name::text     AS foreign_table_name,
        ccu.column_name::text    AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = p_table_name;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- 2) Helper function: Drop a constraint if it matches a specific (table, column) → (foreign_table, foreign_column)
-- ====================================================================================
CREATE OR REPLACE FUNCTION drop_duplicate_fk(
    p_table_name       text,
    p_column_name      text,
    p_foreign_table    text,
    p_foreign_column   text,
    p_correct_fk_name  text
) RETURNS void AS $$
DECLARE
    rec record;
BEGIN
    FOR rec IN
        SELECT constraint_name
        FROM list_foreign_keys(p_table_name)
        WHERE column_name         = p_column_name
          AND foreign_table_name  = p_foreign_table
          AND foreign_column_name = p_foreign_column
          AND constraint_name    != p_correct_fk_name
    LOOP
        RAISE NOTICE 'Dropping duplicate constraint % on table % for column %, referencing %(%).',
            rec.constraint_name, p_table_name, p_column_name, p_foreign_table, p_foreign_column;

        EXECUTE format(
            'ALTER TABLE %I DROP CONSTRAINT %I',
            p_table_name,
            rec.constraint_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- 3) Clean up duplicates & re-add the desired FKs
-- ====================================================================================

DO $$
BEGIN
    -- 3a) Drop duplicates for challenge_rewards(challenge_id → challenges.id)
    PERFORM drop_duplicate_fk(
        'challenge_rewards',
        'challenge_id',
        'challenges',
        'id',
        'fk_challenge_rewards_challenge'
    );

    -- 3b) Drop duplicates for challenge_rules(challenge_id → challenges.id)
    PERFORM drop_duplicate_fk(
        'challenge_rules',
        'challenge_id',
        'challenges',
        'id',
        'fk_challenge_rules_challenge'
    );

    -- 3c) Drop duplicates for challenge_participants(challenge_id → challenges.id)
    PERFORM drop_duplicate_fk(
        'challenge_participants',
        'challenge_id',
        'challenges',
        'id',
        'fk_challenge_participants_challenge'
    );

    -- 3d) Drop duplicates for challenge_participants(user_id → profiles.id)
    PERFORM drop_duplicate_fk(
        'challenge_participants',
        'user_id',
        'profiles',
        'id',
        'fk_challenge_participants_user'
    );

    -- Now recreate them if they're missing:
    -- challenge_rewards -> challenges
    BEGIN
        EXECUTE '
            ALTER TABLE challenge_rewards
            ADD CONSTRAINT fk_challenge_rewards_challenge
            FOREIGN KEY (challenge_id)
            REFERENCES challenges(id)
            ON DELETE CASCADE
        ';
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_challenge_rewards_challenge already exists.';
    END;

    -- challenge_rules -> challenges
    BEGIN
        EXECUTE '
            ALTER TABLE challenge_rules
            ADD CONSTRAINT fk_challenge_rules_challenge
            FOREIGN KEY (challenge_id)
            REFERENCES challenges(id)
            ON DELETE CASCADE
        ';
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_challenge_rules_challenge already exists.';
    END;

    -- challenge_participants -> challenges
    BEGIN
        EXECUTE '
            ALTER TABLE challenge_participants
            ADD CONSTRAINT fk_challenge_participants_challenge
            FOREIGN KEY (challenge_id)
            REFERENCES challenges(id)
            ON DELETE CASCADE
        ';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_challenge_participants_challenge already exists.';
    END;

    -- challenge_participants -> profiles
    BEGIN
        EXECUTE '
            ALTER TABLE challenge_participants
            ADD CONSTRAINT fk_challenge_participants_user
            FOREIGN KEY (user_id)
            REFERENCES profiles(id)
            ON DELETE CASCADE
        ';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_challenge_participants_user already exists.';
    END;
END $$;

-- ====================================================================================
-- 4) Verify required FKs exist without failing if there are extras
-- ====================================================================================
DO $$
DECLARE
    p_table_name text;
    rec record;
    required_fk_info jsonb := '[
      {
        "table":"challenge_rewards",
        "constraint":"fk_challenge_rewards_challenge",
        "column":"challenge_id",
        "foreign_table":"challenges",
        "foreign_column":"id"
      },
      {
        "table":"challenge_rules",
        "constraint":"fk_challenge_rules_challenge",
        "column":"challenge_id",
        "foreign_table":"challenges",
        "foreign_column":"id"
      },
      {
        "table":"challenge_participants",
        "constraint":"fk_challenge_participants_challenge",
        "column":"challenge_id",
        "foreign_table":"challenges",
        "foreign_column":"id"
      },
      {
        "table":"challenge_participants",
        "constraint":"fk_challenge_participants_user",
        "column":"user_id",
        "foreign_table":"profiles",
        "foreign_column":"id"
      }
    ]'::jsonb;
BEGIN
    FOR rec IN
        SELECT jsonb_array_elements(required_fk_info) AS item
    LOOP
        -- Extract each property from the JSON object
        IF NOT EXISTS (
            SELECT 1 
            FROM list_foreign_keys( (rec.item->>'table')::text )
            WHERE constraint_name = (rec.item->>'constraint')::text
              AND column_name      = (rec.item->>'column')::text
              AND foreign_table_name  = (rec.item->>'foreign_table')::text
              AND foreign_column_name = (rec.item->>'foreign_column')::text
        ) THEN
            RAISE EXCEPTION 'Missing required FK % on table %', 
                (rec.item->>'constraint')::text, 
                (rec.item->>'table')::text;
        END IF;
    END LOOP;

    RAISE NOTICE 'All required foreign keys are present and correct.';
END $$; 