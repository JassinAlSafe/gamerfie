import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from '@supabase/supabase-js';
import { GET as getChallenges, POST as createChallenge } from '../challenges/route';
import { POST as claimBadge } from '../challenges/[id]/badges/claim/route';

// Mock user data for testing
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  role: "user"
};

export const mockAdmin = {
  id: "test-admin-id",
  email: "admin@example.com",
  role: "admin"
};

// Mock challenge data
export const mockChallenge = {
  id: "test-challenge-id",
  title: "Test Challenge",
  description: "Test Description",
  type: "competitive",
  status: "upcoming",
  start_date: new Date(Date.now() + 86400000).toISOString(),
  end_date: new Date(Date.now() + 172800000).toISOString(),
  creator_id: mockUser.id,
  goals: [
    {
      type: "play_time",
      target: 3600,
      description: "Play for 1 hour"
    }
  ]
};

// Mock badge data
export const mockBadge = {
  id: "test-badge-id",
  name: "Test Badge",
  description: "Test Badge Description",
  type: "challenge",
  rarity: "common"
};

// Mock fetch responses
export const createTestResponse = async (request: Request, handler: Function) => {
  try {
    const response = await handler(request);
    return response;
  } catch (error) {
    console.error('Test Response Error:', error);
    return new Response(JSON.stringify({ error: 'Internal test error' }), { status: 500 });
  }
};

export const testEndpoint = async (
  method: string,
  url: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    query?: Record<string, string>;
    user?: typeof mockUser | typeof mockAdmin;
  } = {}
) => {
  // Create request object with auth header if user provided
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.user) {
    headers["Authorization"] = `Bearer test-token-${options.user.id}`;
  }

  const request = new Request(
    `http://localhost:3000${url}${
      options.query ? `?${new URLSearchParams(options.query)}` : ""
    }`,
    {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }
  );

  // Extract challenge ID from URL for badge claim endpoint
  const challengeId = url.match(/\/api\/challenges\/([^/]+)\/badges\/claim/)?.[1];
  
  // Create context object for handlers
  const context = {
    params: {
      id: challengeId || options.params?.id
    }
  };

  // Get the appropriate handler based on the URL and method
  let handler;
  if (url.match(/\/api\/challenges\/[^/]+\/badges\/claim/)) {
    if (method === 'POST') {
      handler = (req: Request) => claimBadge(req, context);
    }
  } else if (url.match(/\/api\/challenges$/)) {
    if (method === 'GET') handler = getChallenges;
    else if (method === 'POST') handler = createChallenge;
  }

  if (!handler) {
    throw new Error(`No handler found for ${method} ${url}`);
  }

  return {
    request,
    response: await createTestResponse(request, handler)
  };
};

// Helper to create test data in the database
export const setupTestData = async (supabase: any) => {
  // Create test user
  await supabase.auth.admin.createUser({
    email: mockUser.email,
    user_metadata: { role: mockUser.role }
  });

  // Create test challenge
  await supabase
    .from("challenges")
    .insert(mockChallenge);

  // Create test badge
  await supabase
    .from("badges")
    .insert(mockBadge);
};

// Helper to clean up test data
export const cleanupTestData = async (supabase: any) => {
  await supabase
    .from("challenges")
    .delete()
    .eq("id", mockChallenge.id);

  await supabase
    .from("badges")
    .delete()
    .eq("id", mockBadge.id);

  await supabase.auth.admin.deleteUser(mockUser.id);
};

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockChallenges = [
    {
      id: "4f43e10c-3028-4835-a872-0adddb8378c3",
      title: "Test Challenge",
      description: "Test Description",
      type: "competitive",
      status: "upcoming",
      start_date: "2025-01-02T23:00:00+00:00",
      end_date: "2025-01-25T23:00:00+00:00",
      min_participants: 2,
      max_participants: 10,
      creator_id: mockUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: mockUser.id,
        username: "TestUser",
        avatar_url: "https://example.com/avatar.png"
      },
      participants: [],
      goals: [
        {
          id: "test-goal-id",
          type: "play_time",
          target: 3600,
          description: "Play for 1 hour"
        }
      ],
      rewards: [
        {
          id: "test-reward-id",
          type: "badge",
          name: "Test Badge",
          description: "Test Badge Description",
          badge_id: mockBadge.id
        }
      ]
    }
  ];
  
  const state = {
    idempotencyKeys: new Map<string, {
      key: string;
      status: 'processing' | 'completed' | 'failed';
      expires_at: string;
    }>(),
    claimedBadges: new Set<string>(),
    challenges: [...mockChallenges]
  };

  const createQueryChain = () => {
    let queryState = {
      filters: [] as { field: string; value: any }[],
      orderField: null as string | null,
      orderAsc: true,
      rangeFrom: 0,
      rangeTo: 9
    };

    const chain = {
      select: (query?: string) => chain,
      eq: (field: string, value: any) => {
        queryState.filters.push({ field, value });
        return chain;
      },
      order: (field: string, { ascending = true } = {}) => {
        queryState.orderField = field;
        queryState.orderAsc = ascending;
        return chain;
      },
      range: (from: number, to: number) => {
        queryState.rangeFrom = from;
        queryState.rangeTo = to;
        
        let filteredData = [...mockChallenges];
        
        // Apply filters
        queryState.filters.forEach(filter => {
          filteredData = filteredData.filter(item => item[filter.field] === filter.value);
        });

        // Apply sorting
        if (queryState.orderField) {
          filteredData.sort((a, b) => {
            const aVal = a[queryState.orderField!];
            const bVal = b[queryState.orderField!];
            return queryState.orderAsc ? 
              (aVal > bVal ? 1 : -1) : 
              (aVal < bVal ? 1 : -1);
          });
        }

        // Apply pagination
        const paginatedData = filteredData.slice(
          queryState.rangeFrom,
          queryState.rangeTo + 1
        );

        return Promise.resolve({
          data: paginatedData,
          error: null,
          count: filteredData.length
        });
      },
      single: () => {
        const result = queryState.filters.length > 0 ? 
          mockChallenges.find(item => 
            queryState.filters.every(filter => 
              item[filter.field] === filter.value
            )
          ) : 
          mockChallenges[0];

        return Promise.resolve({
          data: result || null,
          error: null
        });
      }
    };

    return chain;
  };

  const createTableOperations = (table: string) => {
    const baseOperations = {
      select: () => createQueryChain(),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => ({
        eq: (field: string, value: any) => {
          if (table === 'idempotency_keys') {
            const key = state.idempotencyKeys.get(value);
            if (key) {
              state.idempotencyKeys.set(value, { ...key, ...data });
            }
          }
          return Promise.resolve({ data, error: null });
        }
      }),
      upsert: (data: any) => {
        if (table === 'idempotency_keys') {
          state.idempotencyKeys.set(data.key, data);
        }
        return Promise.resolve({ data, error: null });
      },
      delete: () => Promise.resolve({ data: null, error: null })
    };

    switch (table) {
      case 'challenges':
        return createQueryChain();
      case 'challenge_participants':
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ 
                data: { completed: true }, 
                error: null 
              })
            })
          })
        };
      case 'challenge_rewards':
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'test-reward-id',
                  badge_id: mockBadge.id,
                  type: 'badge'
                },
                error: null
              })
            })
          })
        };
      case 'idempotency_keys':
        return {
          ...baseOperations,
          select: () => ({
            eq: (field: string, value: any) => ({
              single: () => {
                const key = state.idempotencyKeys.get(value);
                return Promise.resolve({
                  data: key || null,
                  error: null
                });
              }
            })
          })
        };
      default:
        return {
          ...baseOperations,
          select: () => createQueryChain()
        };
    }
  };

  return {
    from: (table: string) => createTableOperations(table),
    auth: {
      getSession: () => Promise.resolve({
        data: { session: { user: mockUser } },
        error: null
      })
    },
    rpc: (func: string, params?: any) => {
      if (func === 'verify_badge_eligibility') {
        return Promise.resolve({ data: true, error: null });
      }
      if (func === 'claim_challenge_badge') {
        const claimKey = `${params.p_user_id}:${params.p_badge_id}:${params.p_challenge_id}`;
        
        if (state.claimedBadges.has(claimKey)) {
          throw errors.conflict('Badge already claimed');
        }

        state.claimedBadges.add(claimKey);
        return Promise.resolve({ data: true, error: null });
      }
      return Promise.resolve({ data: true, error: null });
    }
  } as unknown as ReturnType<typeof createClient>;
}; 