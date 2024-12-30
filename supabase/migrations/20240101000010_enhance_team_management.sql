-- Add team management enhancements
ALTER TABLE challenge_teams
ADD COLUMN IF NOT EXISTS max_members INTEGER,
ADD COLUMN IF NOT EXISTS min_members INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS team_type TEXT CHECK (team_type IN ('open', 'invite_only', 'auto_assign')) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD CONSTRAINT valid_team_size CHECK (
    (max_members IS NULL) OR
    (max_members > min_members)
);

-- Add team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(team_id, invitee_id)
);

-- Add progress tracking enhancements
CREATE TABLE IF NOT EXISTS progress_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required_progress INTEGER NOT NULL,
    reward_type TEXT,
    reward_amount INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_progress_requirement CHECK (required_progress BETWEEN 0 AND 100)
);

-- Add participant achievement tracking
CREATE TABLE IF NOT EXISTS participant_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES challenge_participants(challenge_id, user_id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES progress_milestones(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_id, milestone_id)
);

-- Add team progress history
CREATE TABLE IF NOT EXISTS team_progress_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_progress CHECK (progress BETWEEN 0 AND 100)
);

-- Add RLS policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress_history ENABLE ROW LEVEL SECURITY;

-- Team invitations policies
CREATE POLICY "Team invitations are viewable by involved users"
    ON team_invitations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE id IN (inviter_id, invitee_id)
        )
    );

CREATE POLICY "Team members can create invitations"
    ON team_invitations FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT cp.user_id 
            FROM challenge_participants cp
            JOIN challenge_teams ct ON cp.team_id = ct.id
            WHERE ct.id = team_id
        )
    );

-- Progress milestones policies
CREATE POLICY "Progress milestones are viewable by everyone"
    ON progress_milestones FOR SELECT
    USING (true);

CREATE POLICY "Only challenge creators can manage milestones"
    ON progress_milestones FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id = auth.uid()
        )
    );

-- Add functions for team management
CREATE OR REPLACE FUNCTION check_team_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM challenge_teams ct
        JOIN (
            SELECT team_id, COUNT(*) as member_count
            FROM challenge_participants
            WHERE team_id = NEW.team_id
            GROUP BY team_id
        ) pc ON ct.id = pc.team_id
        WHERE ct.max_members IS NOT NULL
        AND pc.member_count >= ct.max_members
    ) THEN
        RAISE EXCEPTION 'Team is at maximum capacity';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team capacity check
CREATE TRIGGER check_team_capacity_trigger
    BEFORE INSERT OR UPDATE OF team_id ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION check_team_capacity(); 