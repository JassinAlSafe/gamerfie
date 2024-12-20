-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own games" ON user_games;

-- Create a new policy that allows authenticated users to view all user_games
CREATE POLICY "Users can view all user_games"
  ON user_games FOR SELECT
  TO authenticated
  USING (true);