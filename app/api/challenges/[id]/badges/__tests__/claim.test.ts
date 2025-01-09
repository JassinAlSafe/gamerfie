import { describe, it, expect, vi } from 'vitest';
import { 
  createMockSupabaseClient, 
  mockUser, 
  mockBadge, 
  testEndpoint 
} from '../../../../utils/testUtils';

// Mock the createRouteHandlerClient
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => createMockSupabaseClient()
}));

describe("Badge Claiming API", () => {
  describe("POST /api/challenges/[id]/badges/claim", () => {
    it("should claim badge for completed challenge", async () => {
      const { response } = await testEndpoint(
        "POST", 
        "/api/challenges/test-challenge-id/badges/claim",
        {
          body: {
            badge_id: mockBadge.id
          },
          user: mockUser
        }
      );

      const data = await response.json();
      console.log('Response:', { status: response.status, data });

      expect(response.status).toBe(200);
      expect(data.data.claimed).toBe(true);
    });

    it("should prevent duplicate claims", async () => {
      // First claim
      const firstResponse = await testEndpoint(
        "POST",
        "/api/challenges/test-challenge-id/badges/claim",
        {
          body: {
            badge_id: mockBadge.id
          },
          user: mockUser
        }
      );

      const firstData = await firstResponse.response.json();
      console.log('First Response:', { 
        status: firstResponse.response.status, 
        data: firstData 
      });

      expect(firstResponse.response.status).toBe(200);
      expect(firstData.data.claimed).toBe(true);

      // Second claim attempt
      const { response } = await testEndpoint(
        "POST",
        "/api/challenges/test-challenge-id/badges/claim",
        {
          body: {
            badge_id: mockBadge.id
          },
          user: mockUser
        }
      );

      const data = await response.json();
      console.log('Duplicate Response:', { status: response.status, data });

      expect(response.status).toBe(409);
      expect(data.error).toBe('Badge already claimed');
      expect(data.statusCode).toBe(409);
    });
  });
}); 