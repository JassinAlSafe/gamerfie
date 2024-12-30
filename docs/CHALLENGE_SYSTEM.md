# Enhanced Challenge System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [System Architecture](#system-architecture)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Security & Access Control](#security--access-control)
7. [Validation Rules](#validation-rules)
8. [Error Handling](#error-handling)
9. [Testing & Troubleshooting](#testing--troubleshooting)
10. [User Flows](#user-flows)
11. [Code Examples](#code-examples)

## Overview

The Challenge System is a comprehensive feature that enables users to participate in both competitive and collaborative gaming challenges. It supports multiple goals, team-based participation, and a flexible reward system.

### Key Concepts

- **Challenge Status Flow**: Challenges progress through defined states (upcoming → active → completed)
- **Participation**: Users can join challenges and track their progress
- **Teams**: Support for both individual and team-based challenges
- **Goals & Rewards**: Configurable objectives and achievement rewards

### Status Transitions

The system automatically manages challenge status transitions:

```typescript
// Automatic status updates (runs via scheduled job)
const updateChallengeStatuses = async () => {
  const now = new Date();

  // Update upcoming to active
  await supabase
    .from("challenges")
    .update({ status: "active" })
    .eq("status", "upcoming")
    .lte("start_date", now.toISOString());

  // Update active to completed
  await supabase
    .from("challenges")
    .update({ status: "completed" })
    .eq("status", "active")
    .lte("end_date", now.toISOString());
};
```

## Core Features

### Challenge Types

- **Competitive**: Players or teams compete against each other
- **Collaborative**: Players work together to achieve common goals
- **Status Types**: `upcoming`, `active`, `completed`, `cancelled`

### Challenge Lifecycle

1. **Creation**: User creates a challenge with goals, rules, and rewards
2. **Upcoming**: Challenge is open for participants to join
3. **Active**: Challenge has started, participants work on goals
4. **Completed**: Challenge has ended, rewards distributed
5. **Cancelled**: Challenge was cancelled before completion

### Participant Management

- **Joining**: Users can join upcoming challenges
- **Leaving**: Users can leave challenges with restrictions:
  - Cannot leave active challenges
  - Creator cannot leave their own challenges
  - Cannot leave if you're the only participant
- **Progress Tracking**: Track individual and team progress

### Goals System

```typescript
type ChallengeGoalType =
  | "complete_games"
  | "achieve_trophies"
  | "play_time"
  | "review_games"
  | "score_points"
  | "reach_level";

interface ChallengeGoal {
  id: string;
  challenge_id: string;
  type: ChallengeGoalType;
  target: number;
  description?: string;
  created_at: string;
}
```

### Team Management

```typescript
interface ChallengeTeam {
  id: string;
  challenge_id: string;
  name: string;
  progress: number;
  participants: ChallengeParticipant[];
  created_at: string;
}

interface ChallengeParticipant {
  user: Profile;
  joined_at: string;
  team_id?: string;
}
```

### Challenge Views

The system provides different views for challenges:

1. **All Challenges** (`/challenges`)

   - Browse all available challenges
   - Filter by type and status
   - Join upcoming challenges

2. **Active Challenges** (`/challenges/active`)

   - View currently active challenges
   - Track progress and goals
   - View leaderboards

3. **User Challenge Hub** (`/profile/challenges`)
   - Personal dashboard of joined challenges
   - Progress tracking
   - Challenge management

## User Flows

### Viewing Active Challenges

```typescript
// Fetch active challenges for a user
const fetchUserActiveChallenges = async (userId: string) => {
  try {
    // Get all challenges where user is a participant
    const { data: participations, error: participationsError } = await supabase
      .from("challenge_participants")
      .select("challenge_id")
      .eq("user_id", userId);

    if (participationsError) throw participationsError;

    if (!participations?.length) return [];

    // Get full challenge data
    const { data: challenges, error: challengesError } = await supabase
      .from("challenges")
      .select(
        `
        *,
        goals:challenge_goals (
          id,
          type,
          target,
          description
        ),
        participants:challenge_participants (
          user_id,
          joined_at
        ),
        progress:challenge_participant_progress (
          goal_id,
          progress
        )
      `
      )
      .in(
        "id",
        participations.map((p) => p.challenge_id)
      )
      .eq("status", "active");

    if (challengesError) throw challengesError;

    return challenges || [];
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    throw error;
  }
};

// Filter challenges by status and participation
const filterChallenges = (
  challenges: Challenge[],
  userId: string,
  status: ChallengeStatus = "active"
) => {
  return challenges.filter((challenge) => {
    // Check status
    if (challenge.status !== status) return false;

    // Check participation
    return challenge.participants?.some((p) => p.user_id === userId);
  });
};
```

### Leaving a Challenge

```typescript
// Example implementation of leave challenge logic
const handleLeaveChallenge = async (challenge: Challenge) => {
  try {
    // Validation checks
    if (challenge.status === "active") {
      throw new Error("Cannot leave an active challenge");
    }

    if (challenge.creator_id === userProfile.id) {
      throw new Error("Challenge creator cannot leave");
    }

    if (challenge.participants?.length === 1) {
      throw new Error("Cannot leave as the only participant");
    }

    // Remove participant record
    const { error } = await supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", challenge.id)
      .eq("user_id", userProfile.id);

    if (error) throw error;

    // Update UI and show success message
    return { success: true };
  } catch (error) {
    throw error;
  }
};
```

### Joining a Challenge

```typescript
// Example implementation of join challenge logic
const handleJoinChallenge = async (challenge: Challenge) => {
  try {
    // Validation checks
    if (challenge.status !== "upcoming") {
      throw new Error("Can only join upcoming challenges");
    }

    if (
      challenge.max_participants &&
      challenge.participants.length >= challenge.max_participants
    ) {
      throw new Error("Challenge is full");
    }

    // Add participant record
    const { error } = await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: userProfile.id,
      joined_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Initialize progress records
    if (challenge.goals?.length > 0) {
      const progressRecords = challenge.goals.map((goal) => ({
        challenge_id: challenge.id,
        goal_id: goal.id,
        participant_id: userProfile.id,
        progress: 0,
        created_at: new Date().toISOString(),
      }));

      await supabase
        .from("challenge_participant_progress")
        .insert(progressRecords);
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};
```

## API Endpoints

### Challenge Management

#### GET /api/challenges

Retrieves all available challenges with their goals, teams, and progress information.

#### POST /api/challenges

Creates a new challenge with specified goals, rewards, and rules.

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

#### DELETE /api/challenges/[id]/participants

Removes a participant from a challenge.

```typescript
interface LeaveRequest {
  challenge_id: string;
  user_id: string;
}

interface LeaveResponse {
  success: boolean;
  error?: string;
}
```

## Frontend Components

### Challenge Card Component

```typescript
interface ChallengeCardProps {
  challenge: Challenge;
  onLeave?: (challenge: Challenge) => Promise<void>;
  onJoin?: (challenge: Challenge) => Promise<void>;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onLeave,
  onJoin,
}) => {
  const getTimeStatus = (challenge: Challenge) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (challenge.status === "completed") return "Completed";
    if (now < startDate) return `Starts in ${daysUntilStart} days`;
    if (now > endDate) return "Ended";
    return `${daysUntilEnd} days remaining`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{challenge.title}</CardTitle>
        <Badge>{challenge.type}</Badge>
        <Badge>{getTimeStatus(challenge)}</Badge>
      </CardHeader>
      <CardContent>{/* Challenge details */}</CardContent>
      <CardFooter>
        {onLeave && <Button onClick={() => onLeave(challenge)}>Leave</Button>}
        {onJoin && <Button onClick={() => onJoin(challenge)}>Join</Button>}
      </CardFooter>
    </Card>
  );
};
```

## Error Handling

Common error scenarios and their handling:

```typescript
// Error types
type ChallengeError =
  | "CHALLENGE_NOT_FOUND"
  | "ALREADY_PARTICIPATING"
  | "CHALLENGE_FULL"
  | "CANNOT_LEAVE_ACTIVE"
  | "CREATOR_CANNOT_LEAVE"
  | "SOLE_PARTICIPANT";

// Error handling utility
const handleChallengeError = (error: ChallengeError) => {
  const errorMessages = {
    CHALLENGE_NOT_FOUND: "Challenge not found",
    ALREADY_PARTICIPATING: "Already participating in this challenge",
    CHALLENGE_FULL: "Challenge has reached maximum participants",
    CANNOT_LEAVE_ACTIVE: "Cannot leave an active challenge",
    CREATOR_CANNOT_LEAVE: "Challenge creator cannot leave",
    SOLE_PARTICIPANT: "Cannot leave as the only participant",
  };

  return {
    message: errorMessages[error] || "An unknown error occurred",
    code: error,
  };
};
```

## Testing & Troubleshooting

### Common Issues

1. **Participant Management**

   - Check participant count before allowing joins
   - Validate leave conditions
   - Handle concurrent modifications

2. **Status Updates**

   - Ensure proper status transitions
   - Handle edge cases (e.g., cancelled challenges)
   - Update participant progress correctly

3. **Data Consistency**
   - Maintain referential integrity
   - Handle cascade deletes properly
   - Validate data before operations

## System Architecture

### Components

1. **Frontend (`/test-challenge` page)**

   - UI for challenge creation and management
   - Authentication handling
   - API integration

2. **API Layer**

   - RESTful endpoints
   - Request validation
   - Error handling
   - Response formatting

3. **Database Layer**
   - PostgreSQL with Supabase
   - Row Level Security (RLS)
   - Foreign key relationships
   - Data integrity constraints

## Database Schema

```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('competitive', 'collaborative')),
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  min_participants INTEGER NOT NULL DEFAULT 2,
  max_participants INTEGER,
  creator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_participants (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES challenge_teams(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (challenge_id, user_id)
);

CREATE TABLE challenge_team_progress (
  team_id UUID REFERENCES challenge_teams(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, goal_id)
);

CREATE TABLE challenge_participant_progress (
  participant_id UUID REFERENCES challenge_participants(user_id),
  goal_id UUID REFERENCES challenge_goals(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (participant_id, goal_id)
);

CREATE TABLE challenge_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('badge', 'points', 'title')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security & Access Control

### Row Level Security (RLS)

1. **Enable RLS on Tables**

```sql
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
```

2. **Challenge Access Policies**

```sql
-- Allow reading active challenges if user is a participant
CREATE POLICY "read_active_challenges"
  ON challenges
  FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE challenge_id = id
      AND user_id = auth.uid()
    )
  );

-- Allow reading upcoming challenges for potential joining
CREATE POLICY "read_upcoming_challenges"
  ON challenges
  FOR SELECT
  USING (
    status = 'upcoming'
  );
```

3. **Participant Access Policies**

```sql
-- Allow users to view their own participation
CREATE POLICY "read_own_participation"
  ON challenge_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Allow users to leave non-active challenges
CREATE POLICY "delete_own_participation"
  ON challenge_participants
  FOR DELETE
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM challenges
      WHERE id = challenge_id
      AND status != 'active'
    )
  );
```

### Authentication

- All endpoints require authentication via Supabase session cookie
- Creator-only actions verified through middleware
- Participant-only actions verified through middleware

### Rate Limiting

- API endpoints protected against abuse
- Progress updates limited to reasonable intervals

### Caching

- Leaderboard data cached with short TTL
- Challenge details cached with longer TTL
- User progress cached with very short TTL

## Validation Rules

### Challenge Creation

- Title: 3-100 characters, alphanumeric with spaces/hyphens/underscores
- Description: 10-1000 characters
- Start/End dates: Must be in the future, end after start
- Goals: 1-5 goals per challenge
- Rewards: 1-5 rewards per challenge
- Rules: 1-10 rules per challenge

### Team Management

- Team name: 3-50 characters, alphanumeric with spaces/hyphens/underscores
- Team size: Based on challenge configuration
- Join/Leave: Participants can only be in one team per challenge

## Error Handling

All endpoints return standardized error responses:

```typescript
interface ErrorResponse {
  error: string;
  details?: any;
}
```

Common status codes:

- 400: Bad Request (invalid input)
- 401: Unauthorized (not logged in)
- 403: Forbidden (not allowed to perform action)
- 404: Not Found
- 500: Internal Server Error

## Testing & Troubleshooting

### Common Issues

1. **RLS Policy Conflicts**

   - When adding new policies, first drop existing ones:

   ```sql
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   ```

   - Use DO blocks for error handling:

   ```sql
   DO $$
   BEGIN
     -- Policy creation statements
   END $$;
   ```

2. **Foreign Key Relationships**

   - Ensure proper foreign key constraints exist
   - Required for RLS policies that check parent-child relationships

   ```sql
   ALTER TABLE challenge_goals
   ADD CONSTRAINT fk_challenge_goals_challenges
     FOREIGN KEY (challenge_id)
     REFERENCES challenges (id)
     ON DELETE CASCADE;
   ```

3. **Authentication Issues**

   - Verify user session exists
   - Check user profile is created
   - Ensure proper error handling for auth failures

### Testing Procedures

1. **Create Test Challenge**

   - Use the `/test-challenge` endpoint
   - Verify challenge creation
   - Check related data (goals, rewards, rules) are created

2. **Verify RLS**

   - Confirm users can only modify their own challenges
   - Verify public read access works
   - Test participant joining functionality

## Future Enhancements

1. **Advanced Progress Tracking**

   - Historical progress data
   - Progress visualization
   - Achievement milestones

2. **Social Features**

   - Team chat
   - Challenge invitations
   - Social sharing

3. **Reward System Expansion**

   - Tiered rewards
   - Special achievements
   - Seasonal challenges

4. **Analytics**

   - Participation metrics
   - Completion rates
   - Popular challenge types
