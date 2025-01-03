# Gamerfie Challenge & Badge System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Systems](#core-systems)
   - [Challenge System](#challenge-system)
   - [Badge System](#badge-system)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [Frontend Components](#frontend-components)
9. [Security & Access Control](#security--access-control)
10. [Error Handling](#error-handling)
11. [Testing & Troubleshooting](#testing--troubleshooting)
12. [Code Examples](#code-examples)

## Overview

Gamerfie's integrated Challenge and Badge system enables users to participate in gaming challenges and earn badges for their achievements. This comprehensive system manages competitive and collaborative challenges while rewarding users through an achievement-based badge system.

### Key Concepts

- **Challenge Flow**: Challenges progress through defined states (upcoming → active → completed)
- **Badge Awards**: Users earn badges through challenge completion and special achievements
- **Participation**: Users can join challenges individually or in teams
- **Progress Tracking**: System tracks both challenge progress and badge collections

## Core Systems

### Challenge System

#### Challenge Types

- **Competitive**: Players or teams compete against each other
- **Collaborative**: Players work together to achieve common goals

#### Challenge States

- `upcoming`: Challenge hasn't started yet
- `active`: Challenge is currently running
- `completed`: Challenge has ended
- `cancelled`: Challenge was cancelled

#### Challenge Components

- Goals and rules
- Rewards (including badges)
- Participants and teams
- Media attachments
  - Cover image (stored in Supabase storage under the 'challenges' bucket)
  - Additional media for challenge details
- Progress tracking

### Manual Progress Update System

#### Game Progress Flow

1. **Manual Game Progress Update**

   - Users manually update their game progress (playtime, completion, achievements)
   - Progress is stored in the `user_games` table
   - System records history in `game_progress_history`
   - Updates are made through the game library interface

2. **Challenge Progress Update**

   - When game progress is updated, system checks for related active challenges
   - For each relevant challenge:
     - Calculates progress based on challenge goals (e.g., playtime target)
     - Updates challenge participant progress
     - Marks challenge as completed if progress reaches 100%
   - Progress updates trigger notifications for significant milestones

3. **Badge Claiming Process**
   - When a challenge is completed (progress = 100%):
     - System enables badge claiming for the user
     - User can view available badges in the challenge page
     - User must manually claim each badge
     - System verifies eligibility before awarding badges
   - Badges can only be claimed once per challenge

```typescript
// Manual progress update flow
interface GameProgress {
  play_time?: number;
  completion_percentage?: number;
  achievements_completed?: number;
}

const updateGameProgress = async (
  userId: string,
  gameId: string,
  progress: GameProgress
) => {
  // 1. Update game progress
  await updateUserGameProgress(userId, gameId, progress);

  // 2. Find related active challenges
  const activeChallenges = await findActiveGameChallenges(userId, gameId);

  // 3. Update challenge progress
  for (const challenge of activeChallenges) {
    await updateChallengeProgress(userId, challenge.id);
  }
};

// Badge claiming after challenge completion
const claimChallengeBadge = async (
  userId: string,
  challengeId: string,
  badgeId: string
) => {
  // Verify completion and eligibility
  const canClaim = await verifyBadgeClaim(userId, challengeId, badgeId);
  if (!canClaim) throw new Error("Cannot claim badge");

  // Award badge to user
  await awardBadgeToUser(userId, badgeId, challengeId);
};
```

#### Database Tables

```sql
-- User Games Table (for manual progress tracking)
CREATE TABLE user_games (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    play_time FLOAT DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    achievements_completed INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('playing', 'completed', 'want_to_play', 'dropped')),
    last_played_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, game_id)
);

-- Game Progress History
CREATE TABLE game_progress_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    play_time FLOAT,
    completion_percentage INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Badge System

#### Overview

The badge system is integrated with challenges and allows for standalone achievements. Badges can be awarded for completing challenges, reaching milestones, or special events.

#### Database Schema

#### Badges Table

```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    type TEXT CHECK (type IN ('challenge', 'achievement', 'special', 'community')),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Creating a challenge badge
INSERT INTO badges (name, description, icon_url, type, rarity)
VALUES (
    'First Challenge Complete',
    'Awarded for completing your first challenge',
    'https://example.com/badge-icon.png',
    'challenge',
    'common'
);
```

#### Challenge Rewards Integration

```sql
CREATE TABLE challenge_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('badge', 'points', 'title')),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT challenge_reward_badge_type CHECK (
        (type = 'badge' AND badge_id IS NOT NULL) OR
        (type != 'badge' AND badge_id IS NULL)
    )
);

-- Example: Linking a badge to a challenge as a reward
INSERT INTO challenge_rewards (challenge_id, type, name, description, badge_id)
VALUES (
    '4418047b-8f0c-4291-b2c1-adb72ff4c572',
    'badge',
    'Zombie Slayer Badge',
    'Complete the Zombie Slayer challenge',
    '3f1dc7ee-c443-4bd7-80cd-f239d7a1ac6f'
);
```

#### User Badges Table

```sql
CREATE TABLE user_badges (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id, challenge_id)
);

-- Example: Querying a user's badges
SELECT
    b.name as badge_name,
    b.description,
    b.rarity,
    ub.claimed_at,
    c.title as challenge_title
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
LEFT JOIN challenges c ON c.id = ub.challenge_id
WHERE ub.user_id = '85d11176-6c16-4b9b-bc64-ebbe92f48df3';
```

### Badge Claiming System

The system includes a function to handle badge claims with proper validation:

```sql
CREATE OR REPLACE FUNCTION claim_challenge_badge(
    p_user_id UUID,
    p_challenge_id UUID,
    p_badge_id UUID
) RETURNS boolean AS $$
DECLARE
    v_completed boolean;
    v_reward_exists boolean;
BEGIN
    -- Check if the badge is a reward for this challenge
    SELECT EXISTS (
        SELECT 1 FROM challenge_rewards
        WHERE challenge_id = p_challenge_id
        AND badge_id = p_badge_id
        AND type = 'badge'
    ) INTO v_reward_exists;

    IF NOT v_reward_exists THEN
        RETURN false;
    END IF;

    -- Check if user completed the challenge
    SELECT completed INTO v_completed
    FROM challenge_participants
    WHERE challenge_id = p_challenge_id
    AND user_id = p_user_id;

    IF NOT COALESCE(v_completed, false) THEN
        RETURN false;
    END IF;

    -- Insert into user_badges if not already claimed
    INSERT INTO user_badges (user_id, badge_id, challenge_id)
    VALUES (p_user_id, p_badge_id, p_challenge_id)
    ON CONFLICT DO NOTHING;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Claiming a badge
SELECT claim_challenge_badge(
    '85d11176-6c16-4b9b-bc64-ebbe92f48df3',  -- user_id
    '4418047b-8f0c-4291-b2c1-adb72ff4c572',  -- challenge_id
    '3f1dc7ee-c443-4bd7-80cd-f239d7a1ac6f'   -- badge_id
);
```

### Challenge Badges View

For easier querying of challenge-related badges:

```sql
CREATE OR REPLACE VIEW challenge_badges AS
SELECT
    c.id as challenge_id,
    c.title as challenge_title,
    b.id as badge_id,
    b.name as badge_name,
    b.description as badge_description,
    b.icon_url,
    b.type as badge_type,
    b.rarity,
    cr.id as reward_id
FROM challenges c
JOIN challenge_rewards cr ON cr.challenge_id = c.id
JOIN badges b ON b.id = cr.badge_id
WHERE cr.type = 'badge';

-- Example: Viewing badges for a specific challenge
SELECT * FROM challenge_badges
WHERE challenge_id = '4418047b-8f0c-4291-b2c1-adb72ff4c572';
```

### Badge Claiming Flow

1. **Challenge Completion**

   - User completes a challenge (progress reaches 100%)
   - Challenge is marked as completed

   ```sql
   UPDATE challenge_participants
   SET
       progress = 100,
       completed = true
   WHERE challenge_id = '4418047b-8f0c-4291-b2c1-adb72ff4c572'
   AND user_id = '85d11176-6c16-4b9b-bc64-ebbe92f48df3';
   ```

2. **Badge Claim**

   - System verifies challenge completion
   - Checks if badge is a valid reward
   - Awards badge if not already claimed

   ```sql
   -- Check available badges
   SELECT * FROM challenge_badges
   WHERE challenge_id = '4418047b-8f0c-4291-b2c1-adb72ff4c572';

   -- Claim the badge
   SELECT claim_challenge_badge(user_id, challenge_id, badge_id);
   ```

3. **Verification**
   - Check claimed badges
   ```sql
   SELECT
       b.name as badge_name,
       b.rarity,
       c.title as challenge_title,
       ub.claimed_at
   FROM user_badges ub
   JOIN badges b ON b.id = ub.badge_id
   LEFT JOIN challenges c ON c.id = ub.challenge_id
   WHERE ub.user_id = '85d11176-6c16-4b9b-bc64-ebbe92f48df3';
   ```

### Security & Access Control

The badge system implements Row Level Security (RLS) policies:

```sql
-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
    ON badges FOR SELECT
    USING (true);

-- Only admins can manage badges
CREATE POLICY "Only admins can manage badges"
    ON badges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Users can claim their own badges
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
```

## Data Flow

### Challenge Lifecycle

1. **Creation Flow**

   ```typescript
   interface CreateChallengeRequest {
     title: string;
     description: string;
     type: "competitive" | "collaborative";
     start_date: string;
     end_date: string;
     goals: Array<{
       type: ChallengeGoalType;
       target: number;
       description?: string;
     }>;
     max_participants?: number;
     rewards: ChallengeReward[];
     rules: Array<string | { rule: string }>;
     cover_image?: File; // Optional cover image for the challenge
   }

   const createChallenge = async (request: CreateChallengeRequest) => {
     try {
       // 1. Create challenge record
       const { data: challenge, error } = await supabase
         .from("challenges")
         .insert({
           title: request.title,
           description: request.description,
           type: request.type,
           start_date: request.start_date,
           end_date: request.end_date,
           max_participants: request.max_participants,
         })
         .select()
         .single();

       if (error) throw error;

       // 2. Upload cover image if provided
       if (request.cover_image) {
         const cover_url = await uploadCoverImage(
           request.cover_image,
           challenge.id
         );
         await supabase
           .from("challenges")
           .update({ cover_url })
           .eq("id", challenge.id);
       }

       // 3. Create goals
       await Promise.all(
         request.goals.map((goal) =>
           supabase.from("challenge_goals").insert({
             challenge_id: challenge.id,
             type: goal.type,
             target: goal.target,
             description: goal.description,
           })
         )
       );

       // 4. Create rewards
       await Promise.all(
         request.rewards.map((reward) =>
           supabase.from("challenge_rewards").insert({
             challenge_id: challenge.id,
             type: reward.type,
             name: reward.name,
             description: reward.description,
             badge_id: reward.badge_id,
           })
         )
       );

       return { success: true, challenge };
     } catch (error) {
       throw error;
     }
   };
   ```

````

2. **Participation Flow**

   ```typescript
   const handleJoinChallenge = async (challenge: Challenge) => {
     try {
       // Validation checks
       if (challenge.status !== "upcoming") {
         throw new Error("Can only join upcoming challenges");
       }

       // Add participant record
       const { error } = await supabase.from("challenge_participants").insert({
         challenge_id: challenge.id,
         user_id: userProfile.id,
         joined_at: new Date().toISOString(),
       });

       if (error) throw error;

       // Initialize progress tracking
       await initializeProgress(challenge.id, userProfile.id);

       return { success: true };
     } catch (error) {
       throw error;
     }
   };
   ```

### Badge Award Flow

1. **Achievement Triggers**

   - Challenge completion
   - Milestone achievements
   - Special events
   - Community contributions

2. **Award Process**

   ```typescript
   const awardBadge = async (
     userId: string,
     badgeId: string,
     challengeId?: string
   ) => {
     try {
       const { error } = await supabase.from("user_badges").insert({
         user_id: userId,
         badge_id: badgeId,
         challenge_id: challengeId,
         claimed_at: new Date().toISOString(),
       });

       if (error) throw error;

       // Trigger notification
       await sendBadgeNotification(userId, badgeId);

       return { success: true };
     } catch (error) {
       throw error;
     }
   };
   ```

## Database Schema

### Core Tables

```sql
-- Challenges Table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('competitive', 'collaborative')),
    status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    min_participants INTEGER NOT NULL DEFAULT 2,
    max_participants INTEGER,
    creator_id UUID REFERENCES profiles(id),
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Participants Table
CREATE TABLE challenge_participants (
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Challenge Participant Progress Table
CREATE TABLE challenge_participant_progress (
    participant_id UUID REFERENCES challenge_participants(user_id),
    goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (participant_id, goal_id)
);

-- Badges Table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    type TEXT CHECK (type IN ('challenge', 'achievement', 'special', 'community')),
    rarity TEXT CHECK (type IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges Table
CREATE TABLE user_badges (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id, challenge_id)
);
```

### Supporting Tables

```sql
-- Challenge Goals Table
CREATE TABLE challenge_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    target INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Teams Table
CREATE TABLE challenge_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Progress Table
CREATE TABLE challenge_team_progress (
    team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, goal_id)
);
```

## API Endpoints

### Challenge Endpoints

```typescript
// List challenges with filters
GET /api/challenges
Query Parameters:
- status: "all" | "upcoming" | "active" | "completed"
- type: "competitive" | "collaborative"
- participating: boolean

// Create challenge
POST /api/challenges
Body: CreateChallengeRequest

// Get challenge details
GET /api/challenges/[id]

// Join challenge
POST /api/challenges/[id]/join

// Leave challenge
POST /api/challenges/[id]/leave

// Update challenge progress
POST /api/challenges/[id]/progress
Body: {
  goalId: string;
  progress: number;
}
```

### Badge Endpoints

```typescript
// List all badges
GET /api/badges
Query Parameters:
- type: "challenge" | "achievement" | "special" | "community"
- claimed: boolean

// Get user badges
GET /api/badges/user/[userId]

// Claim badge
POST /api/badges/claim
Body: {
  badgeId: string;
  challengeId?: string;
}
```

## State Management

### Challenge Store (Zustand)

```typescript
interface ChallengesState {
  challenges: Challenge[];
  filteredChallenges: Challenge[];
  activeChallenges: Challenge[];
  upcomingChallenges: Challenge[];
  completedChallenges: Challenge[];
  isLoading: boolean;
  filter: "all" | ChallengeType;
  statusFilter: "all" | ChallengeStatus;
  sortBy: "date" | "participants";

  // Actions
  fetchChallenges: () => Promise<void>;
  filterChallenges: (filter: ChallengeFilter) => void;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateProgress: (challengeId: string, progress: number) => Promise<void>;
}
```

### Badge Store (Zustand)

```typescript
interface BadgeState {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBadges: () => Promise<void>;
  fetchUserBadges: (userId: string) => Promise<void>;
  claimBadge: (badgeId: string, challengeId?: string) => Promise<void>;
}
```

## Frontend Components

### Challenge Components

```typescript
// Challenge Card Component
const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onJoin,
  onLeave,
}) => {
  const timeStatus = useTimeStatus(challenge);
  const progress = useProgress(challenge);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{challenge.title}</CardTitle>
        <Badge>{challenge.type}</Badge>
        <Badge>{timeStatus}</Badge>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
        <GoalsList goals={challenge.goals} />
      </CardContent>
      <CardFooter>
        {canJoin && <Button onClick={onJoin}>Join Challenge</Button>}
        {canLeave && <Button onClick={onLeave}>Leave Challenge</Button>}
      </CardFooter>
    </Card>
  );
};

// Badge Card Component
const BadgeCard: React.FC<BadgeProps> = ({ badge, isClaimed, onClaim }) => {
  return (
    <Card>
      <CardHeader>
        <BadgeIcon src={badge.icon_url} />
        <CardTitle>{badge.name}</CardTitle>
        <Badge>{badge.rarity}</Badge>
      </CardHeader>
      <CardContent>
        <p>{badge.description}</p>
      </CardContent>
      <CardFooter>
        {!isClaimed && canClaim && (
          <Button onClick={onClaim}>Claim Badge</Button>
        )}
      </CardFooter>
    </Card>
  );
};
```

## Security & Access Control

### Row Level Security (RLS)

```sql
-- Challenge access policies
CREATE POLICY "Users can view challenges"
    ON challenges FOR SELECT
    USING (true);

CREATE POLICY "Users can create challenges"
    ON challenges FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE id = creator_id
    ));

-- Badge access policies
CREATE POLICY "Users can view badges"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Users can view own badge claims"
    ON user_badges FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can claim badges"
    ON user_badges FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

## Error Handling

```typescript
// Error types
type SystemError =
  | "CHALLENGE_NOT_FOUND"
  | "ALREADY_PARTICIPATING"
  | "CHALLENGE_FULL"
  | "CANNOT_LEAVE_ACTIVE"
  | "BADGE_NOT_FOUND"
  | "BADGE_ALREADY_CLAIMED"
  | "INVALID_CLAIM_CONDITIONS";

// Error handling utility
const handleSystemError = (error: SystemError) => {
  const errorMessages = {
    CHALLENGE_NOT_FOUND: "Challenge not found",
    ALREADY_PARTICIPATING: "Already participating in this challenge",
    CHALLENGE_FULL: "Challenge has reached maximum participants",
    CANNOT_LEAVE_ACTIVE: "Cannot leave an active challenge",
    BADGE_NOT_FOUND: "Badge not found",
    BADGE_ALREADY_CLAIMED: "Badge already claimed",
    INVALID_CLAIM_CONDITIONS: "Badge claim conditions not met",
  };

  return {
    message: errorMessages[error] || "An unknown error occurred",
    code: error,
  };
};
```

## Testing & Troubleshooting

### Test Cases

1. Challenge Lifecycle

   - Creation and validation
   - Participation management
   - Progress tracking
   - Completion and rewards

2. Badge System

   - Achievement conditions
   - Claiming process
   - Multiple claims handling
   - Notification system

3. Integration Tests
   - Challenge completion → Badge award
   - Team progress → Individual rewards
   - Error handling and recovery

### Common Issues

1. Data Consistency

   - Challenge status transitions
   - Progress tracking accuracy
   - Badge claim validation

2. Performance

   - Leaderboard calculations
   - Progress updates
   - Badge award processing

3. Security
   - Authentication validation
   - Authorization checks
   - RLS policy enforcement

## Future Enhancements

1. Advanced Features

   - Seasonal challenges
   - Badge trading system
   - Achievement chains
   - Team tournaments

2. Social Integration

   - Challenge sharing
   - Badge showcasing
   - Team communication
   - Social achievements

3. Analytics
   - Participation metrics
   - Badge distribution
   - User engagement
   - Challenge popularity

### Storage System

#### Challenge Media Storage

Challenge media, including cover images, are stored in Supabase Storage:

- **Bucket**: `challenges`
- **Access Control**:
  - Public read access for cover images
  - Authenticated upload access for challenge creators
  - Delete access for challenge owners
- **File Types**: Images (jpg, jpeg, png, gif)
- **Usage**: Cover images are displayed on challenge cards and detail pages

```typescript
// Example: Uploading a challenge cover image
const uploadCoverImage = async (
  file: File,
  challengeId: string
): Promise<string> => {
  const path = `${challengeId}/cover`;
  const { data, error } = await supabase.storage
    .from('challenges')
    .upload(path, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('challenges')
    .getPublicUrl(path);

  return publicUrl;
};
```
```
````
