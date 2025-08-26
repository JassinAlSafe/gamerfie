import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force dynamic route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get forum stats using the database function
    const { data: stats, error } = await supabase.rpc('get_forum_stats');

    if (error) {
      console.error("Error fetching forum stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch forum stats" },
        { status: 500 }
      );
    }

    return NextResponse.json(stats || {
      total_threads: 0,
      total_posts: 0,
      total_users: 0,
      active_users_today: 0
    });
  } catch (error) {
    console.error("Error in forum stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch forum stats" },
      { status: 500 }
    );
  }
}