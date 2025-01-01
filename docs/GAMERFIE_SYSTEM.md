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
- Progress tracking

### Badge System

#### Badge Types

- Challenge completion badges
- Achievement milestone badges
- Special event badges
- Community contribution badges

#### Badge Components

- Icon and visual design
- Achievement conditions
- Rarity levels
- Unlock requirements

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
   }
   ```

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
