-- Drop existing policies
DROP POLICY IF EXISTS "Users can claim badges for completed challenges" ON user_badges;
DROP POLICY IF EXISTS "Users can view all badge claims" ON user_badges;

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for claiming badges
CREATE POLICY "Users can claim badges"
ON user_badges FOR INSERT
TO authenticated
WITH CHECK (
    -- User can only claim badges for themselves
    auth.uid() = user_id
    AND
    -- Either the badge is from a challenge they completed
    (
        challenge_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM challenge_participants cp
            WHERE cp.challenge_id = user_badges.challenge_id
            AND cp.user_id = auth.uid()
            AND cp.completed = true
        )
        AND EXISTS (
            SELECT 1 FROM challenge_rewards cr
            WHERE cr.challenge_id = user_badges.challenge_id
            AND cr.badge_id = user_badges.badge_id
            AND cr.type = 'badge'
        )
    )
    OR
    -- Or it's a non-challenge badge (for future use)
    (
        challenge_id IS NULL
        AND EXISTS (
            SELECT 1 FROM badges b
            WHERE b.id = user_badges.badge_id
        )
    )
);

-- Create policy for viewing badges
CREATE POLICY "Users can view badge claims"
ON user_badges FOR SELECT
TO authenticated
USING (true);

-- Add helpful comments
COMMENT ON POLICY "Users can claim badges" ON user_badges IS 'Allow users to claim badges for completed challenges or non-challenge badges';
COMMENT ON POLICY "Users can view badge claims" ON user_badges IS 'Allow authenticated users to view all badge claims'; 