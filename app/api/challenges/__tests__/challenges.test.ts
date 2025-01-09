import { describe, it, expect, vi } from 'vitest';
import { createMockSupabaseClient, mockUser, mockChallenge, testEndpoint } from '../../utils/testUtils';

// Mock the createRouteHandlerClient
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => createMockSupabaseClient()
}));

describe("Challenges API", () => {
  describe("GET /api/challenges", () => {
    it("should return paginated challenges", async () => {
      const { response } = await testEndpoint("GET", "/api/challenges", {
        query: {
          page: "1",
          limit: "10"
        },
        user: mockUser
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(1);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      });
    });

    it("should filter challenges by type", async () => {
      const { response } = await testEndpoint("GET", "/api/challenges", {
        query: {
          type: "competitive"
        },
        user: mockUser
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges[0].type).toBe("competitive");
    });
  });
}); 