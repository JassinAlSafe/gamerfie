-- Step 1: Add badge_id to challenge_rewards
ALTER TABLE challenge_rewards
ADD COLUMN badge_id UUID REFERENCES badges(id) ON DELETE SET NULL;

-- Step 2: Add constraint to ensure badge_id is set when type is 'badge'
ALTER TABLE challenge_rewards
ADD CONSTRAINT challenge_reward_badge_type CHECK (
    (type = 'badge'::reward_type AND badge_id IS NOT NULL) OR
    (type != 'badge'::reward_type AND badge_id IS NULL)
);

-- Step 3: Create a function to handle badge claims
CREATE OR REPLACE FUNCTION claim_challenge_badge(
    p_user_id UUID,
    p_challenge_id UUID,
    p_badge_id UUID
) RETURNS boolean AS $$
DECLARE
    v_completed boolean;
    v_reward_exists boolean;
BEGIN
    -- Check if the badge is a reward for this challenge
    SELECT EXISTS (
        SELECT 1 FROM challenge_rewards
        WHERE challenge_id = p_challenge_id
        AND badge_id = p_badge_id
        AND type = 'badge'::reward_type
    ) INTO v_reward_exists;

    IF NOT v_reward_exists THEN
        RETURN false;
    END IF;

    -- Check if user completed the challenge
    SELECT completed INTO v_completed
    FROM challenge_participants
    WHERE challenge_id = p_challenge_id
    AND user_id = p_user_id;

    IF NOT COALESCE(v_completed, false) THEN
        RETURN false;
    END IF;

    -- Insert into user_badges if not already claimed
    INSERT INTO user_badges (user_id, badge_id, challenge_id)
    VALUES (p_user_id, p_badge_id, p_challenge_id)
    ON CONFLICT DO NOTHING;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a view for easier badge querying
CREATE OR REPLACE VIEW challenge_badges AS
SELECT 
    c.id as challenge_id,
    c.title as challenge_title,
    b.id as badge_id,
    b.name as badge_name,
    b.description as badge_description,
    b.icon_url,
    b.type as badge_type,
    b.rarity,
    cr.id as reward_id
FROM challenges c
JOIN challenge_rewards cr ON cr.challenge_id = c.id
JOIN badges b ON b.id = cr.badge_id
WHERE cr.type = 'badge'::reward_type;

-- Step 5: Add policies for the view
CREATE POLICY "Challenge badges are viewable by everyone"
    ON challenge_badges FOR SELECT
    USING (true);

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_badge_id ON challenge_rewards(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_composite ON user_badges(user_id, badge_id, challenge_id);

-- Step 7: Add helpful comments
COMMENT ON FUNCTION claim_challenge_badge IS 'Claims a badge for a completed challenge if eligible';
COMMENT ON VIEW challenge_badges IS 'Shows all badges associated with challenges';
COMMENT ON COLUMN challenge_rewards.badge_id IS 'Reference to the badge when reward type is badge'; 