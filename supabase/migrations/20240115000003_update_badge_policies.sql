-- Drop existing admin policy
DROP POLICY IF EXISTS "Only admins can manage badges" ON badges;

-- Create separate policies for different operations
CREATE POLICY "Admins can create badges"
    ON badges FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'::public.user_role
        )
    );

CREATE POLICY "Admins can update badges"
    ON badges FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'::public.user_role
        )
    );

CREATE POLICY "Admins can delete badges"
    ON badges FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'::public.user_role
        )
    );

-- Add cascade delete triggers for badge relationships
CREATE OR REPLACE FUNCTION delete_badge_relationships()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete related challenge rewards
    DELETE FROM challenge_rewards WHERE badge_id = OLD.id;
    -- Delete related user badges
    DELETE FROM user_badges WHERE badge_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_badge_delete
    BEFORE DELETE ON badges
    FOR EACH ROW
    EXECUTE FUNCTION delete_badge_relationships(); 