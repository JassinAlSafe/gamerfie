import type { GameStats } from "@/types/user";
import type { FriendActivity } from "@/types/activity";

/**
 * Type guard for checking if gameStats is valid
 */
export function isValidGameStats(stats: unknown): stats is GameStats {
  return (
    stats !== null &&
    typeof stats === "object" &&
    "total_played" in stats &&
    typeof stats.total_played === "number"
  );
}

/**
 * Type guard for checking if activity has required properties
 */
export function isValidActivity(activity: FriendActivity | any): boolean {
  if (!activity) return false;

  try {
    // Check if the activity object has the basic required properties
    const hasBasicProps =
      typeof activity === "object" && "id" in activity && "type" in activity;

    if (!hasBasicProps) {
      console.log("Activity missing basic properties:", activity);
      return false;
    }

    // Check for user property
    const hasValidUser =
      "user" in activity &&
      activity.user !== null &&
      typeof activity.user === "object" &&
      "username" in activity.user;

    if (!hasValidUser) {
      console.log("Activity has invalid user:", activity.user);
      return false;
    }

    // Check for game property
    const hasValidGame =
      "game" in activity &&
      activity.game !== null &&
      typeof activity.game === "object" &&
      "name" in activity.game;

    if (!hasValidGame) {
      console.log("Activity has invalid game:", activity.game);
      return false;
    }

    // Check for timestamp/created_at
    const hasValidTimestamp =
      "created_at" in activity || "timestamp" in activity;

    if (!hasValidTimestamp) {
      console.log("Activity missing timestamp:", activity);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating activity:", error);
    return false;
  }
}