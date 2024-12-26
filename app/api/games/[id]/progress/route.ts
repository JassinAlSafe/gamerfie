import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const progress = await request.json();

    // Validate required fields
    if (!progress) {
      return NextResponse.json(
        { error: "Progress data is required" },
        { status: 400 }
      );
    }

    // Update user_games table
    const { error: updateError } = await supabase
      .from("user_games")
      .upsert({
        user_id: session.user.id,
        game_id: params.id,
        play_time: progress.play_time,
        completion_percentage: progress.completion_percentage,
        achievements_completed: progress.achievements_completed,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,game_id'
      });

    if (updateError) {
      console.error("Error updating game progress:", updateError);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    // Record progress history
    if (progress.play_time !== undefined || progress.completion_percentage !== undefined) {
      const { error: historyError } = await supabase
        .from("game_progress_history")
        .insert({
          user_id: session.user.id,
          game_id: params.id,
          play_time: progress.play_time,
          completion_percentage: progress.completion_percentage,
        });

      if (historyError) {
        console.error("Error recording progress history:", historyError);
      }
    }

    // Record achievement history
    if (progress.achievements_completed !== undefined) {
      const { error: achievementError } = await supabase
        .from("game_achievement_history")
        .insert({
          user_id: session.user.id,
          game_id: params.id,
          achievements_completed: progress.achievements_completed,
        });

      if (achievementError) {
        console.error("Error recording achievement history:", achievementError);
      }
    }

    return NextResponse.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Error in progress update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 