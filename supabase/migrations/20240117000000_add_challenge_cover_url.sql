-- Add cover_url column to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update create_challenge function to include cover_url
CREATE OR REPLACE FUNCTION create_challenge(
  challenge_data JSONB,
  goals_data JSONB[],
  rewards_data JSONB[],
  rules_data JSONB[],
  cover_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_id UUID;
BEGIN
  -- Insert challenge
  INSERT INTO challenges (
    title,
    description,
    type,
    status,
    start_date,
    end_date,
    min_participants,
    max_participants,
    creator_id,
    created_at,
    updated_at,
    cover_url
  )
  VALUES (
    challenge_data->>'title',
    challenge_data->>'description',
    challenge_data->>'type',
    challenge_data->>'status',
    (challenge_data->>'start_date')::TIMESTAMPTZ,
    (challenge_data->>'end_date')::TIMESTAMPTZ,
    (challenge_data->>'min_participants')::INTEGER,
    (challenge_data->>'max_participants')::INTEGER,
    (challenge_data->>'creator_id')::UUID,
    COALESCE((challenge_data->>'created_at')::TIMESTAMPTZ, NOW()),
    COALESCE((challenge_data->>'updated_at')::TIMESTAMPTZ, NOW()),
    cover_url
  )
  RETURNING id INTO v_challenge_id;

  -- Insert goals
  IF array_length(goals_data, 1) > 0 THEN
    INSERT INTO challenge_goals (challenge_id, type, target, description)
    SELECT 
      v_challenge_id,
      (goal->>'type')::TEXT,
      (goal->>'target')::INTEGER,
      goal->>'description'
    FROM unnest(goals_data) AS goal;
  END IF;

  -- Insert rewards
  IF array_length(rewards_data, 1) > 0 THEN
    INSERT INTO challenge_rewards (challenge_id, type, name, description)
    SELECT 
      v_challenge_id,
      (reward->>'type')::TEXT,
      reward->>'name',
      reward->>'description'
    FROM unnest(rewards_data) AS reward;
  END IF;

  -- Insert rules
  IF array_length(rules_data, 1) > 0 THEN
    INSERT INTO challenge_rules (challenge_id, rule)
    SELECT 
      v_challenge_id,
      rule->>'rule'
    FROM unnest(rules_data) AS rule;
  END IF;

  RETURN v_challenge_id;
END;
$$; 