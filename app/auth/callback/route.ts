import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  console.log('Auth callback: Full URL:', request.url);
  console.log('Auth callback: Params - code:', !!code, 'error:', error, 'type:', type, 'next:', next);

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth provider error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_failed', requestUrl.origin));
  }

  // Handle password recovery flow - check for various patterns
  const hasTokenHash = requestUrl.searchParams.has('token_hash');
  const hasAccessToken = requestUrl.searchParams.has('access_token');
  const hasRefreshToken = requestUrl.searchParams.has('refresh_token');
  const hasExpiresIn = requestUrl.searchParams.has('expires_in');
  
  // Pattern matching for password recovery (Supabase sends different params for password reset)
  const isPasswordRecovery = type === 'recovery' || 
                            next?.includes('reset-password') || 
                            next?.includes('type=recovery') ||
                            requestUrl.searchParams.toString().includes('recovery') ||
                            (hasTokenHash && hasAccessToken && hasRefreshToken) ||
                            (hasAccessToken && hasExpiresIn && !requestUrl.searchParams.has('state'));

  console.log('Auth callback: Recovery detection - type:', type, 'hasTokenHash:', hasTokenHash, 'hasAccessToken:', hasAccessToken, 'isPasswordRecovery:', isPasswordRecovery);

  if (isPasswordRecovery && (code || hasTokenHash || hasAccessToken)) {
    console.log('Auth callback: Handling password recovery for origin:', requestUrl.origin);
    const supabase = await createClient();

    try {
      let user, session, authError;

      if (hasTokenHash || hasAccessToken) {
        // Handle token-based password recovery (from email links)
        console.log('Auth callback: Using token-based recovery');
        const { data, error } = await supabase.auth.getUser();
        user = data.user;
        session = null; // Session will be established after password reset
        authError = error;
      } else if (code) {
        // Handle code-based recovery
        console.log('Auth callback: Using code-based recovery');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        user = data.user;
        session = data.session;
        authError = error;
      }
      
      if (authError) {
        console.error('Password recovery exchange error:', authError);
        return NextResponse.redirect(new URL('/reset-password?error=invalid_token', requestUrl.origin));
      }

      // For password recovery, we might not have a session yet
      if (!user && !hasAccessToken) {
        console.error('No user received for password recovery');
        return NextResponse.redirect(new URL('/reset-password?error=no_user', requestUrl.origin));
      }

      console.log('Password recovery session established for user:', user.email, 'redirecting to reset form');
      return NextResponse.redirect(new URL('/reset-password?recovery=true', requestUrl.origin));

    } catch (error) {
      console.error('Password recovery callback error:', error);
      return NextResponse.redirect(new URL('/reset-password?error=callback_failed', requestUrl.origin));
    }
  }

  if (code) {
    const supabase = await createClient();

    try {
      // Exchange code for session
      const { data: { user, session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Auth callback: Exchange result - user:', !!user, 'session:', !!session, 'error:', authError);
      
      if (authError) {
        console.error('Auth exchange error:', authError);
        return NextResponse.redirect(new URL('/signin?error=auth_failed', requestUrl.origin));
      }

      if (!user || !session) {
        console.error('No user or session received');
        return NextResponse.redirect(new URL('/signin?error=no_session', requestUrl.origin));
      }

      // Check if this might be a password recovery session by examining metadata
      const isLikelyPasswordRecovery = session.access_token && 
                                       !isPasswordRecovery && 
                                       (requestUrl.searchParams.has('code') && !requestUrl.searchParams.has('state'));
      
      if (isLikelyPasswordRecovery) {
        console.log('Auth callback: Detected potential password recovery session, redirecting to reset form');
        return NextResponse.redirect(new URL('/reset-password?recovery=true', requestUrl.origin));
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
        // Existing user - they should go to the main app
        // Only treat as new user if profile was literally just created (within last minute)
        const profileCreatedAt = new Date(existingProfile.created_at);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        isNewUser = profileCreatedAt > oneMinuteAgo;
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
