import { createClient } from "@/utils/supabase/client";
import { ActivityDetails } from "./activity.types";

export async function createActivity(
  activity_type: string,
  game_id: string,
  details?: ActivityDetails
) {
  const supabase = createClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error("User not logged in");

  try {
    const { error } = await supabase.from("friend_activities").insert({
      user_id: session.session.user.id,
      game_id,
      activity_type,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error creating activity", error);
    throw error;
  }
}

export async function updateGameTimeStap(gameId: string) {
  const supabase = createClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  const timestamp = new Date().toISOString();

  // update user_games timestap
  await supabase
    .from("user_games")
    .update({ updated_at: timestamp })
    .eq("user_id", session.session.user.id)
    .eq("game_id", gameId);

  await supabase
    .from("game_progress_history")
    .update({ updated_at: timestamp })
    .eq("user_id", session.session.user.id)
    .eq("game_id", gameId)
    .order("created_at", { ascending: false })
    .limit(1);
}
