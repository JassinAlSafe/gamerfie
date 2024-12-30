-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies for challenges
  DROP POLICY IF EXISTS "Allow users to view all challenges" ON challenges;
  DROP POLICY IF EXISTS "Allow users to create challenges" ON challenges;
  
  -- Drop policies for challenge_goals
  DROP POLICY IF EXISTS "Allow users to view all goals" ON challenge_goals;
  DROP POLICY IF EXISTS "Allow challenge creator to insert goals" ON challenge_goals;
  
  -- Drop policies for challenge_teams
  DROP POLICY IF EXISTS "Allow users to view all teams" ON challenge_teams;
  DROP POLICY IF EXISTS "Allow challenge creator to insert teams" ON challenge_teams;
  
  -- Drop policies for challenge_participants
  DROP POLICY IF EXISTS "Allow users to view all participants" ON challenge_participants;
  DROP POLICY IF EXISTS "Allow users to join challenges" ON challenge_participants;
  
  -- Drop policies for challenge_rewards
  DROP POLICY IF EXISTS "Allow users to view all rewards" ON challenge_rewards;
  DROP POLICY IF EXISTS "Allow challenge creator to insert rewards" ON challenge_rewards;
  
  -- Drop policies for challenge_rules
  DROP POLICY IF EXISTS "Allow users to view all rules" ON challenge_rules;
  DROP POLICY IF EXISTS "Allow challenge creator to insert rules" ON challenge_rules;
END $$;

-- Enable RLS on all tables (these are idempotent)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rules ENABLE ROW LEVEL SECURITY;

-- Create new policies
DO $$ 
BEGIN
  -- Policies for challenges table
  CREATE POLICY "Allow users to view all challenges"
    ON challenges FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow users to create challenges"
    ON challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

  -- Policies for challenge_goals table
  CREATE POLICY "Allow users to view all goals"
    ON challenge_goals FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow challenge creator to insert goals"
    ON challenge_goals FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM challenges
        WHERE id = challenge_goals.challenge_id
        AND creator_id = auth.uid()
      )
    );

  -- Policies for challenge_teams table
  CREATE POLICY "Allow users to view all teams"
    ON challenge_teams FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow challenge creator to insert teams"
    ON challenge_teams FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM challenges
        WHERE id = challenge_teams.challenge_id
        AND creator_id = auth.uid()
      )
    );

  -- Policies for challenge_participants table
  CREATE POLICY "Allow users to view all participants"
    ON challenge_participants FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow users to join challenges"
    ON challenge_participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  -- Policies for challenge_rewards table
  CREATE POLICY "Allow users to view all rewards"
    ON challenge_rewards FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow challenge creator to insert rewards"
    ON challenge_rewards FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM challenges
        WHERE id = challenge_rewards.challenge_id
        AND creator_id = auth.uid()
      )
    );

  -- Policies for challenge_rules table
  CREATE POLICY "Allow users to view all rules"
    ON challenge_rules FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow challenge creator to insert rules"
    ON challenge_rules FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM challenges
        WHERE id = challenge_rules.challenge_id
        AND creator_id = auth.uid()
      )
    );
END $$; 