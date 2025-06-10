"use client";

import { createClient } from "@/utils/supabase/client";

export function CacheBuster() {
  // Temporarily disabled to fix authentication flashing issues
  // TODO: Implement a more selective cache clearing strategy
  return null;
}

// Enhanced utility function to mark 406 errors with tracking
export const mark406Error = () => {
  const now = Date.now().toString();
  sessionStorage.setItem("recent_406_errors", now);
  sessionStorage.setItem("last_406_time", now);

  // Track error count
  const errorCount =
    parseInt(sessionStorage.getItem("406_error_count") || "0") + 1;
  sessionStorage.setItem("406_error_count", errorCount.toString());

  console.log(`Marked 406 error #${errorCount} at ${new Date(parseInt(now))}`);
};

// Enhanced fetch wrapper that handles 406 errors with better retry logic
export const enhancedSupabaseQuery = async (queryFn: () => Promise<any>) => {
  try {
    const result = await queryFn();
    // Clear error count on successful query
    sessionStorage.removeItem("406_error_count");
    return result;
  } catch (error: any) {
    if (
      error?.code === "PGRST301" ||
      error?.message?.includes("406") ||
      error?.status === 406
    ) {
      console.warn("Detected 406 error:", error);
      mark406Error();

      // Try clearing cache immediately
      const supabase = createClient();
      try {
        await supabase.auth.refreshSession();
      } catch (refreshError) {
        console.warn("Error refreshing session:", refreshError);
      }

      // Try once more after a short delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const retryResult = await queryFn();
        console.log("Retry successful after 406 error");
        return retryResult;
      } catch (retryError) {
        console.warn("Retry also failed, returning empty result:", retryError);
        // Return empty result instead of throwing
        return { data: [], error: null };
      }
    }
    throw error;
  }
};
