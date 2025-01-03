-- Drop existing policies
DROP POLICY IF EXISTS "Users can claim their own badges" ON user_badges;
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON user_badges;

-- Create new policies
CREATE POLICY "Users can claim their own badges"
    ON user_badges FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_id = user_badges.challenge_id
            AND user_id = auth.uid()
            AND completed = true
        )
    );

CREATE POLICY "Users can view badges"
    ON user_badges FOR SELECT
    USING (true);

-- Add helpful comments
COMMENT ON POLICY "Users can claim their own badges" ON user_badges IS 'Allow users to claim badges for completed challenges';
COMMENT ON POLICY "Users can view badges" ON user_badges IS 'Allow everyone to view badge claims'; 