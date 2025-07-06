import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth provider error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_failed', requestUrl.origin));
  }

  if (code) {
    const supabase = await createClient();

    try {
      // Exchange code for session
      const { data: { user, session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Auth exchange error:', authError);
        return NextResponse.redirect(new URL('/signin?error=auth_failed', requestUrl.origin));
      }

      if (!user || !session) {
        console.error('No user or session received');
        return NextResponse.redirect(new URL('/signin?error=no_session', requestUrl.origin));
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let isNewUser = false;

      // If no profile exists, create one
      if (!existingProfile) {
        isNewUser = true;
        const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
        const displayName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           username;
        
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username,
            display_name: displayName,
            email: user.email || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: 'user',
            settings: { onboarded: false },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } else {
        // Check if existing user has completed onboarding
        const hasOnboarded = existingProfile.settings?.onboarded === true;
        if (!hasOnboarded) {
          isNewUser = true;
        }
      }

      // Redirect based on user status
      if (isNewUser) {
        return NextResponse.redirect(new URL('/welcome?new=true', requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL('/?auth=success', requestUrl.origin));
      }

    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/signin?error=callback_failed', requestUrl.origin));
    }
  }

  // No code provided - redirect to signin
  return NextResponse.redirect(new URL('/signin?error=no_code', requestUrl.origin));
}
