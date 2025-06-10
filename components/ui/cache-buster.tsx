"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function CacheBuster() {
  useEffect(() => {
    const clearSupabaseCache = async () => {
      // Clear browser cache for Supabase REST API calls
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        console.log("Clearing all Supabase-related caches...");

        // Clear all cached requests to Supabase
        if ("caches" in window) {
          try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
              if (
                name.includes("supabase") ||
                name.includes("rest") ||
                name.includes("user_games")
              ) {
                await caches.delete(name);
                console.log(`Deleted cache: ${name}`);
              }
            }
          } catch (error) {
            console.warn("Error clearing caches:", error);
          }
        }

        // Clear localStorage and sessionStorage items related to Supabase
        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes("supabase") || key.includes("sb-"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          const sessionKeysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (
              key &&
              (key.includes("supabase") ||
                key.includes("sb-") ||
                key.includes("406"))
            ) {
              sessionKeysToRemove.push(key);
            }
          }
          sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
        } catch (error) {
          console.warn("Error clearing storage:", error);
        }
      }

      // Force refresh Supabase client and auth
      try {
        const supabase = createClient();
        // Trigger auth refresh to ensure fresh session
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          console.log("Auth session refreshed successfully");
          // Force refresh the user session
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        console.warn("Error refreshing auth:", error);
      }
    };

    // Clear cache on component mount
    clearSupabaseCache();

    // Set up more aggressive periodic cache clearing for 406 errors
    const interval = setInterval(() => {
      const recent406 = sessionStorage.getItem("recent_406_errors");
      const last406Time = sessionStorage.getItem("last_406_time");
      const now = Date.now();

      if (recent406 || (last406Time && now - parseInt(last406Time) < 60000)) {
        console.log(
          "Detected recent 406 errors, performing aggressive cache clear"
        );
        clearSupabaseCache();
        sessionStorage.removeItem("recent_406_errors");
        sessionStorage.removeItem("last_406_time");

        // Also try to force refresh the page if 406 errors persist
        const errorCount = parseInt(
          sessionStorage.getItem("406_error_count") || "0"
        );
        if (errorCount > 5) {
          console.log("Too many 406 errors, forcing page refresh");
          sessionStorage.removeItem("406_error_count");
          window.location.reload();
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
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
        console.warn("Retry also failed, returning empty result");
        // Return empty result instead of throwing
        return { data: [], error: null };
      }
    }
    throw error;
  }
};
