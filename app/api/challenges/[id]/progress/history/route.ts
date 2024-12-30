import { NextResponse } from "next/server";
import { withAuth } from "../../../middleware";
import { withRateLimit } from "../../../middleware/rateLimit";
import { withCache, cacheConfigs } from "../../../middleware/cache";

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

interface ProgressHistoryEntry {
  timestamp: string;
  goal_id: string;
  progress: number;
  milestone?: string;
}

interface ProgressHistoryResponse {
  challenge_id: string;
  history: ProgressHistoryEntry[];
}

const handler = withAuth(async (
  request: Request,
  { params }: RouteParams,
  { supabase, session }: HandlerContext
) => {
  try {
    // Get progress history for the user in this challenge
    const { data: history, error: historyError } = await supabase
      .from("challenge_progress_history")
      .select(`
        timestamp,
        goal_id,
        progress,
        milestone
      `)
      .eq("challenge_id", params.id)
      .eq("user_id", session.user.id)
      .order("timestamp", { ascending: true });

    if (historyError) {
      console.error("Error fetching progress history:", historyError);
      return NextResponse.json(
        { error: "Failed to fetch progress history", details: historyError },
        { status: 500 }
      );
    }

    const response: ProgressHistoryResponse = {
      challenge_id: params.id,
      history: history || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching progress history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Apply rate limiting and caching middleware
export const GET = withRateLimit(
  withCache(handler, {
    ...cacheConfigs.userProgress,
    prefix: "progress-history",
  }),
  { maxRequests: 30, windowMs: 60 * 1000 } // 30 requests per minute
); 