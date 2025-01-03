-- Create badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    type TEXT CHECK (type IN ('challenge', 'achievement', 'special', 'community')),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE user_badges (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id, challenge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage badges"
    ON badges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
    ON user_badges FOR SELECT
    USING (true);

CREATE POLICY "Users can claim their own badges"
    ON user_badges FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_id = user_badges.challenge_id
            AND user_id = user_badges.user_id
            AND completed = true
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_badges_type ON badges(type);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_challenge_id ON user_badges(challenge_id); 