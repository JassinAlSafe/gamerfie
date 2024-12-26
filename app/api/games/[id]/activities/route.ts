import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 10;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: activities, error } = await supabase
      .from("friend_activities")
      .select(`
        id,
        activity_type,
        details,
        created_at,
        user:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("game_id", params.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching game activities:", error);
      return new NextResponse(error.message, { status: 500 });
    }

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.activity_type,
      details: activity.details,
      timestamp: activity.created_at,
      user: activity.user
    }));

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("Error in game activities route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 