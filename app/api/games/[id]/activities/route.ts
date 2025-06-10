import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 10;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Ensure game ID is a string
    const gameId = params.id.toString();

    const { data, error, count } = await supabase
      .from("friend_activities")
      .select(
        `
        id,
        activity_type,
        details,
        created_at,
        user:profiles (
          id,
          username,
          avatar_url
        ),
        reactions:activity_reactions (
          id,
          emoji,
          type,
          user_id,
          user:profiles (
            id,
            username,
            avatar_url
          )
        ),
        comments:activity_comments (
          id,
          content,
          created_at,
          user:profiles (
            id,
            username,
            avatar_url
          )
        )
        `,
        { count: "exact" }
      )
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching game activities:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: data || [],
        hasMore: count ? offset + ITEMS_PER_PAGE < count : false,
        total: count || 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching game activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch game activities" },
      { status: 500 }
    );
  }
} 