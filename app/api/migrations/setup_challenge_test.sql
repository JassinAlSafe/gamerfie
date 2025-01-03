-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_badge_claims CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenge_badges CASCADE;
DROP TABLE IF EXISTS challenge_rewards CASCADE;
DROP TABLE IF EXISTS challenge_goals CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

-- Create badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('competitive', 'collaborative')),
    status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    min_participants INTEGER NOT NULL,
    max_participants INTEGER,
    creator_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenge_goals table
CREATE TABLE challenge_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    target INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenge_rewards table with badge_id column
CREATE TABLE challenge_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('badge', 'points', 'title')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenge_badges table
CREATE TABLE challenge_badges (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, badge_id)
);

-- Create challenge_participants table
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    goal_progress JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create user_badge_claims table
CREATE TABLE user_badge_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_read_badges" ON badges;
DROP POLICY IF EXISTS "allow_read_challenges" ON challenges;
DROP POLICY IF EXISTS "allow_read_goals" ON challenge_goals;
DROP POLICY IF EXISTS "allow_read_rewards" ON challenge_rewards;
DROP POLICY IF EXISTS "allow_read_challenge_badges" ON challenge_badges;
DROP POLICY IF EXISTS "allow_read_participants" ON challenge_participants;
DROP POLICY IF EXISTS "allow_read_user_badge_claims" ON user_badge_claims;
DROP POLICY IF EXISTS "allow_insert_challenges" ON challenges;
DROP POLICY IF EXISTS "allow_insert_goals" ON challenge_goals;
DROP POLICY IF EXISTS "allow_insert_rewards" ON challenge_rewards;
DROP POLICY IF EXISTS "allow_insert_badges" ON badges;
DROP POLICY IF EXISTS "allow_insert_challenge_badges" ON challenge_badges;
DROP POLICY IF EXISTS "allow_insert_participants" ON challenge_participants;
DROP POLICY IF EXISTS "allow_insert_user_badge_claims" ON user_badge_claims;
DROP POLICY IF EXISTS "allow_update_participants" ON challenge_participants;

-- Create policies for authenticated users
CREATE POLICY "allow_read_badges" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_challenges" ON challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_goals" ON challenge_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_rewards" ON challenge_rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_challenge_badges" ON challenge_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_participants" ON challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_read_user_badge_claims" ON user_badge_claims 
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Allow insert for authenticated users
CREATE POLICY "allow_insert_badges" ON badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_challenges" ON challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_goals" ON challenge_goals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_rewards" ON challenge_rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_challenge_badges" ON challenge_badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_participants" ON challenge_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_insert_user_badge_claims" ON user_badge_claims 
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- Allow update for participants
CREATE POLICY "allow_update_participants" ON challenge_participants 
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid()); 