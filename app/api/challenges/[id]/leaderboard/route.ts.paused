import { NextResponse } from "next/server";
import { withAuth } from "../../middleware";
import { withRateLimit } from "../../middleware/rateLimit";
import { withCache, cacheConfigs } from "../../middleware/cache";

interface RouteParams {
  params: {
    id: string;
  };
}

type HandlerContext = {
  supabase: any;
  session: {
    user: {
      id: string;
    };
  };
};

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string;
  progress: number;
  completed: boolean;
}

interface LeaderboardResponse {
  challenge_id: string;
  rankings: LeaderboardEntry[];
}

const handler = withAuth(async (
  _request: Request,
  { params }: RouteParams,
  { supabase }: HandlerContext
) => {
  try {
    // Get all participants with their progress
    const { data: participants, error: participantsError } = await supabase
      .from("challenge_participants")
      .select(`
        user_id,
        progress,
        completed,
        user:profiles!inner(
          username,
          avatar_url
        )
      `)
      .eq("challenge_id", params.id)
      .order("progress", { ascending: false });

    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      return NextResponse.json(
        { error: "Failed to fetch participants", details: participantsError },
        { status: 500 }
      );
    }

    // Transform and rank participants
    const rankings: LeaderboardEntry[] = participants.map((participant: any, index: number) => ({
      rank: index + 1,
      user_id: participant.user_id,
      username: participant.user.username,
      avatar_url: participant.user.avatar_url,
      progress: participant.progress,
      completed: participant.completed,
    }));

    const response: LeaderboardResponse = {
      challenge_id: params.id,
      rankings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Apply rate limiting and caching middleware
export const GET = withRateLimit(
  async (request: Request, ...args: any[]) => {
    const handlerFn = await handler;
    // Create a mutable copy of the cache config
    const cacheConfig = {
      ...cacheConfigs.leaderboard,
      invalidateOn: [...cacheConfigs.leaderboard.invalidateOn]
    };
    return withCache(handlerFn, cacheConfig)(request, ...args);
  },
  { maxRequests: 50, windowMs: 60 * 1000 } // 50 requests per minute
); 