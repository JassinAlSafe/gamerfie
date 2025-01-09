## Overview

The challenge creation process involves:

1. Form submission with challenge details
2. Storage of challenge data in Supabase
3. Upload and storage of challenge media
4. Creation of related records (goals, rules, rewards)

## Database Schema

### Main Tables

```sql
-- Core challenge table
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge media (for cover images)
CREATE TABLE challenge_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge goals
CREATE TABLE challenge_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge rules
CREATE TABLE challenge_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge rewards
CREATE TABLE challenge_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Form Data Structure

```typescript
interface ChallengeFormData {
  title: string;
  description: string;
  type: "competitive" | "collaborative";
  start_date: Date;
  end_date: Date;
  min_participants: number;
  max_participants?: number;
  goals: {
    type: string;
    target: number;
    description?: string;
  }[];
  rules: string[];
  rewards: {
    type: "badge" | "points" | "title";
    name: string;
    description: string;
  }[];
  requirements: {
    genre?: string;
    platform?: string;
    minRating?: number;
    releaseYear?: number;
  };
}
```

## Creation Process

### 1. Handle Form Submission

```typescript
const handleSubmit = async (data: ChallengeFormData) => {
  try {
    setIsSubmitting(true);

    // 1. Create the challenge
    const { data: challenge, error } = await supabase
      .from("challenges")
      .insert({
        title: data.title,
        description: data.description,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        min_participants: data.min_participants,
        max_participants: data.max_participants,
        requirements: data.requirements,
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Upload cover image if exists
    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("challenge-covers")
        .upload(`${challenge.id}/cover`, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("challenge-covers")
        .getPublicUrl(`${challenge.id}/cover`);

      // Create media record
      await supabase.from("challenge_media").insert({
        challenge_id: challenge.id,
        media_type: "cover",
        url: publicUrl,
      });
    }

    // 3. Create goals
    await supabase.from("challenge_goals").insert(
      data.goals.map((goal) => ({
        challenge_id: challenge.id,
        ...goal,
      }))
    );

    // 4. Create rules
    await supabase.from("challenge_rules").insert(
      data.rules.map((rule) => ({
        challenge_id: challenge.id,
        rule,
      }))
    );

    // 5. Create rewards
    await supabase.from("challenge_rewards").insert(
      data.rewards.map((reward) => ({
        challenge_id: challenge.id,
        ...reward,
      }))
    );

    toast({
      title: "Success",
      description: "Challenge created successfully!",
    });

    router.push("/profile/challenges");
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create challenge",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
```


## Required Supabase Setup

### Storage Bucket

1. Create a storage bucket named `challenge-covers`
2. Set up public access policy:

```sql
CREATE POLICY "Challenge covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'challenge-covers');
```

### RLS Policies

```sql
-- Challenges
CREATE POLICY "Anyone can view challenges"
ON challenges FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create challenges"
ON challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Challenge Media
CREATE POLICY "Anyone can view challenge media"
ON challenge_media FOR SELECT USING (true);

CREATE POLICY "Challenge creators can add media"
ON challenge_media FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT creator_id FROM challenges WHERE id = challenge_id
  )
);

-- Similar policies needed for goals, rules, and rewards tables
```

## Error Handling

- Validate form data using Zod schema
- Handle storage upload errors
- Handle database insertion errors
- Provide user feedback via toast notifications
- Rollback on partial failures (using transactions when possible)

## Best Practices

1. Always validate form data before submission
2. Use proper error handling and user feedback
3. Optimize image uploads (compression, size limits)
4. Implement proper security policies
5. Use transactions for related data insertions
6. Validate dates and participant limits
7. Sanitize user input

