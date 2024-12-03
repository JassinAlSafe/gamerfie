import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Exchange the code for a session
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;

      // Get the user after successful authentication
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        // Check if a profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching profile:", fetchError);
        }

        if (!existingProfile) {
          // Create a new profile
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username:
                user.email?.split("@")[0] ||
                `user_${Math.random().toString(36).substr(2, 9)}`,
              email: user.email,
              display_name:
                user.user_metadata.full_name || user.email?.split("@")[0],
              avatar_url: user.user_metadata.avatar_url,
              bio: null,
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            // Consider how you want to handle this error (e.g., redirect to an error page)
          }
        }

        // Redirect to the dashboard or profile page after successful sign-in and profile creation
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Error in authentication process:", error);
      // Redirect to an error page or sign-in page
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // If there's no code, redirect to the home page
  return NextResponse.redirect(new URL("/", request.url));
}
