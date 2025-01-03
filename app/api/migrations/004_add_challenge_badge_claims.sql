-- Create challenge_badges table for linking badges to challenges
CREATE TABLE IF NOT EXISTS challenge_badges (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, badge_id)
);

-- Create user_badge_claims table for tracking claimed badges
CREATE TABLE IF NOT EXISTS user_badge_claims (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id, challenge_id)
);

-- Enable RLS
ALTER TABLE challenge_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_claims ENABLE ROW LEVEL SECURITY;

-- Policies for challenge_badges
CREATE POLICY "allow_challenge_creator_insert" ON challenge_badges
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id = auth.uid()
        )
    );

CREATE POLICY "allow_view_challenge_badges" ON challenge_badges
    FOR SELECT TO authenticated
    USING (true);

-- Policies for user_badge_claims
CREATE POLICY "allow_user_claim_badge" ON user_badge_claims
    FOR INSERT TO authenticated
    WITH CHECK (
        -- User can only claim their own badges
        user_id = auth.uid() AND
        -- Challenge must be completed by the user
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_id = user_badge_claims.challenge_id
            AND user_id = auth.uid()
            AND completed = true
        ) AND
        -- Badge must be assigned to the challenge
        EXISTS (
            SELECT 1 FROM challenge_badges
            WHERE challenge_id = user_badge_claims.challenge_id
            AND badge_id = user_badge_claims.badge_id
        )
    );

CREATE POLICY "allow_view_own_badge_claims" ON user_badge_claims
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Function to check if a user can claim a badge
CREATE OR REPLACE FUNCTION can_claim_badge(
    p_user_id UUID,
    p_badge_id UUID,
    p_challenge_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has completed the challenge
    IF NOT EXISTS (
        SELECT 1 FROM challenge_participants
        WHERE challenge_id = p_challenge_id
        AND user_id = p_user_id
        AND completed = true
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check if badge is assigned to the challenge
    IF NOT EXISTS (
        SELECT 1 FROM challenge_badges
        WHERE challenge_id = p_challenge_id
        AND badge_id = p_badge_id
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check if user hasn't already claimed this badge for this challenge
    IF EXISTS (
        SELECT 1 FROM user_badge_claims
        WHERE user_id = p_user_id
        AND badge_id = p_badge_id
        AND challenge_id = p_challenge_id
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 