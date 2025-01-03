import { describe, it, expect } from 'vitest';
import { createChallengeSchema, updateChallengeSchema } from '../schemas';

describe('Challenge Schemas', () => {
  it('should validate a valid challenge creation', () => {
    const validChallenge = {
      title: "Test Challenge",
      description: "Test Description that is long enough",
      type: "competitive" as const,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
      goals: [
        {
          type: "play_time" as const,
          target: 3600,
          description: "Play for 1 hour"
        }
      ]
    };

    const result = createChallengeSchema.safeParse(validChallenge);
    expect(result.success).toBe(true);
  });

  it('should validate a valid challenge update', () => {
    const validUpdate = {
      title: "Updated Title",
      description: "Updated description that is long enough"
    };

    const result = updateChallengeSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
}); 