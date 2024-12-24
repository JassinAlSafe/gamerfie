-- Create enum types
CREATE TYPE challenge_type AS ENUM ('collaborative', 'competitive');
CREATE TYPE challenge_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');
CREATE TYPE challenge_goal_type AS ENUM ('complete_games', 'achieve_trophies', 'play_time', 'review_games', 'score_points');
CREATE TYPE reward_type AS ENUM ('badge', 'points', 'title');

-- Create challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type challenge_type NOT NULL,
    status challenge_status NOT NULL DEFAULT 'upcoming',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    goal_type challenge_goal_type NOT NULL,
    goal_target INTEGER NOT NULL,
    min_participants INTEGER,
    max_participants INTEGER,
    game_id TEXT REFERENCES games(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_participants CHECK (
        (min_participants IS NULL AND max_participants IS NULL) OR
        (min_participants IS NULL AND max_participants > 0) OR
        (max_participants IS NULL AND min_participants > 0) OR
        (min_participants > 0 AND max_participants >= min_participants)
    )
);

-- Create challenge participants table
CREATE TABLE challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Create challenge rewards table
CREATE TABLE challenge_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    type reward_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge rules table
CREATE TABLE challenge_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    rule TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge tags table
CREATE TABLE challenge_tags (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (challenge_id, tag)
);

-- Create claimed rewards table
CREATE TABLE claimed_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES challenge_rewards(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, reward_id)
);

-- Create RLS policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_rewards ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone"
    ON challenges FOR SELECT
    USING (true);

CREATE POLICY "Users can create challenges"
    ON challenges FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE id = creator_id
    ));

CREATE POLICY "Creators can update their challenges"
    ON challenges FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = creator_id
    ));

CREATE POLICY "Creators can delete their challenges"
    ON challenges FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = creator_id
    ));

-- Challenge participants policies
CREATE POLICY "Participants are viewable by everyone"
    ON challenge_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join challenges"
    ON challenge_participants FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "Users can update their own progress"
    ON challenge_participants FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "Users can leave challenges"
    ON challenge_participants FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = user_id
    ));

-- Challenge rewards policies
CREATE POLICY "Rewards are viewable by everyone"
    ON challenge_rewards FOR SELECT
    USING (true);

CREATE POLICY "Only challenge creators can manage rewards"
    ON challenge_rewards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id IN (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Challenge rules policies
CREATE POLICY "Rules are viewable by everyone"
    ON challenge_rules FOR SELECT
    USING (true);

CREATE POLICY "Only challenge creators can manage rules"
    ON challenge_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id IN (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Challenge tags policies
CREATE POLICY "Tags are viewable by everyone"
    ON challenge_tags FOR SELECT
    USING (true);

CREATE POLICY "Only challenge creators can manage tags"
    ON challenge_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM challenges
            WHERE id = challenge_id
            AND creator_id IN (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Claimed rewards policies
CREATE POLICY "Claimed rewards are viewable by everyone"
    ON claimed_rewards FOR SELECT
    USING (true);

CREATE POLICY "Users can claim rewards"
    ON claimed_rewards FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_id = claimed_rewards.challenge_id
            AND user_id = claimed_rewards.user_id
            AND completed = true
        )
    );

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenge_participants_updated_at
    BEFORE UPDATE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 