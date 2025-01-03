-- First, modify the challenge_rewards table to reference badges
ALTER TABLE challenge_rewards
ADD COLUMN badge_id UUID REFERENCES badges(id),
ADD CONSTRAINT challenge_reward_type_badge CHECK (
    (type = 'badge' AND badge_id IS NOT NULL) OR
    (type != 'badge' AND badge_id IS NULL)
);

-- Create a view to make badge querying easier
CREATE VIEW challenge_badges AS
SELECT 
    c.id as challenge_id,
    c.title as challenge_title,
    b.id as badge_id,
    b.name as badge_name,
    b.description as badge_description,
    b.icon_url,
    b.type,
    b.rarity
FROM challenges c
JOIN challenge_rewards cr ON cr.challenge_id = c.id
JOIN badges b ON b.id = cr.badge_id
WHERE cr.type = 'badge';

-- Function to claim a badge
CREATE OR REPLACE FUNCTION claim_challenge_badge(
    p_user_id UUID,
    p_challenge_id UUID,
    p_badge_id UUID
) RETURNS boolean AS $$
DECLARE
    v_completed boolean;
BEGIN
    -- Check if user completed the challenge
    SELECT completed INTO v_completed
    FROM challenge_participants
    WHERE challenge_id = p_challenge_id
    AND user_id = p_user_id;

    -- If not completed or not found, return false
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

-- Add policies for the new view
CREATE POLICY "Challenge badges are viewable by everyone"
    ON challenge_badges FOR SELECT
    USING (true);

-- Create indexes for the new relationships
CREATE INDEX idx_challenge_rewards_badge_id ON challenge_rewards(badge_id);

-- Comment on objects
COMMENT ON VIEW challenge_badges IS 'View that shows all badges associated with challenges';
COMMENT ON FUNCTION claim_challenge_badge IS 'Function to claim a badge for a completed challenge'; 