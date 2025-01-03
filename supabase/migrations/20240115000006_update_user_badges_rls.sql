-- Drop existing policies
DROP POLICY IF EXISTS "Users can claim badges for completed challenges" ON user_badges;
DROP POLICY IF EXISTS "Users can view all badge claims" ON user_badges;

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for claiming badges
CREATE POLICY "Users can claim badges for completed challenges"
ON user_badges FOR INSERT
TO authenticated
WITH CHECK (
    -- User can only claim badges for themselves
    auth.uid() = user_id
    AND
    -- Challenge must exist and be completed by the user
    EXISTS (
        SELECT 1 FROM challenge_participants cp
        WHERE cp.challenge_id = user_badges.challenge_id
        AND cp.user_id = auth.uid()
        AND cp.completed = true
    )
    AND
    -- Badge must be assigned as a reward for the challenge
    EXISTS (
        SELECT 1 FROM challenge_rewards cr
        WHERE cr.challenge_id = user_badges.challenge_id
        AND cr.badge_id = user_badges.badge_id
        AND cr.type = 'badge'
    )
    AND
    -- User hasn't already claimed this badge for this challenge
    NOT EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = auth.uid()
        AND ub.badge_id = user_badges.badge_id
        AND ub.challenge_id = user_badges.challenge_id
    )
);

-- Create policy for viewing badges
CREATE POLICY "Users can view all badge claims"
ON user_badges FOR SELECT
TO authenticated
USING (true);

-- Add helpful comments
COMMENT ON POLICY "Users can claim badges for completed challenges" ON user_badges IS 'Allow users to claim badges for challenges they have completed and have not already claimed';
COMMENT ON POLICY "Users can view all badge claims" ON user_badges IS 'Allow authenticated users to view all badge claims'; 