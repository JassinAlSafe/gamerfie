import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ITEMS_PER_PAGE = 10;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
        type,
        details,
        metadata,
        created_at,
        user:profiles!friend_activities_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        reactions:activity_reactions (
          count,
          user_has_reacted:user_id
        ),
        comments:activity_comments (
          count
        )
        `,
        { count: "exact" }
      )
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching game activities:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        data: data || [],
        hasMore: count ? offset + ITEMS_PER_PAGE < count : false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching game activities:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch game activities" }),
      { status: 500 }
    );
  }
} 