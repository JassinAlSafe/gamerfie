# Challenge API Documentation

## Endpoints

### GET /api/challenges

Retrieves all challenges with their goals, teams, and progress information.

**Response:**

```typescript
{
  id: string;
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  status: "upcoming" | "active" | "completed";
  start_date: string;
  end_date: string;
  creator: {
    id: string;
    username: string;
    avatar_url: string;
  }
  goals: Array<{
    id: string;
    type:
      | "complete_games"
      | "achieve_trophies"
      | "play_time"
      | "review_games"
      | "score_points"
      | "reach_level";
    target: number;
    description?: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    progress: number;
    participants: Array<{
      user: {
        id: string;
        username: string;
        avatar_url: string;
      };
      joined_at: string;
    }>;
  }>;
  rewards: Array<{
    type: "badge" | "points" | "title";
    name: string;
    description: string;
  }>;
}
```

### POST /api/challenges

Creates a new challenge with goals, rewards, and rules.

**Request Body:**

```typescript
{
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  goals: Array<{
    type: "complete_games" | "achieve_trophies" | "play_time" | "review_games" | "score_points" | "reach_level";
    target: number;
    description?: string;
  }>;
  max_participants?: number;
  rewards: Array<{
    type: "badge" | "points" | "title";
    name: string;
    description: string;
  }>;
  rules: Array<string | { rule: string }>;
}
```

### GET /api/challenges/[id]

Retrieves a specific challenge with all related data.

**Response:** Same as GET /api/challenges but for a single challenge.

### PUT /api/challenges/[id]

Updates a specific challenge. Only the creator can update the challenge.

**Request Body:** Same as POST /api/challenges

### DELETE /api/challenges/[id]

Deletes a specific challenge. Only the creator can delete the challenge.

### GET /api/challenges/user

Retrieves all challenges for the authenticated user with their progress.

**Response:**

```typescript
Array<{
  // Challenge data (same as above)
  user_progress: number; // Overall progress for the user
  user_team?: string; // ID of the user's team if they're in one
}>;
```

### POST /api/challenges/[id]/goals

Creates a new goal for a challenge. Only the creator can add goals.

**Request Body:**

```typescript
{
  type: "complete_games" | "achieve_trophies" | "play_time" | "review_games" | "score_points" | "reach_level";
  target: number;
  description?: string;
}
```

### PUT /api/challenges/[id]/goals

Updates progress for a goal.

**Request Body:**

```typescript
{
  goalId: string;
  progress: number; // 0-100
}
```

### POST /api/challenges/[id]/teams

Creates a new team for a challenge.

**Request Body:**

```typescript
{
  name: string;
}
```

### PUT /api/challenges/[id]/teams

Joins or leaves a team.

**Request Body:**

```typescript
{
  teamId?: string; // Required for joining
  action: "join" | "leave";
}
```

## Error Responses

All endpoints may return the following error responses:

```typescript
{
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

## Authentication

All endpoints require authentication via Supabase session cookie. Requests without valid authentication will receive a 401 response.
