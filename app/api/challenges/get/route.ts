import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("challenges")
      .select(`
        *,
        creator:creator_id(id, username, avatar_url),
        participants:challenge_participants(
          user:user_id(id, username, avatar_url),
          joined_at,
          progress,
          completed
        ),
        rewards:challenge_rewards(*),
        rules:challenge_rules(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch challenges:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch challenges" },
      { status: 500 }
    );
  }
} 