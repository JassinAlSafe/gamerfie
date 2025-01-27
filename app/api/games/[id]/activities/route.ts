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

    const { data, error, count } = await supabase
      .from("game_activities")
      .select(
        `
        id,
        type,
        metadata,
        created_at,
        user:user_id (
          id,
          username,
          avatar_url
        ),
        reactions:game_activity_reactions (
          count,
          user_has_reacted:user_id
        ),
        comments:game_activity_comments (
          count
        )
        `,
        { count: "exact" }
      )
      .eq("game_id", params.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
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