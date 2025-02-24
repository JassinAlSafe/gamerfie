import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    try {
      const { data: { session, user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
      if (authError) throw authError;

      if (user) {
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw profileError;
        }

        // If no profile exists, create one
        if (!existingProfile) {
          const username = user.email?.split('@')[0] || 'user';
          const displayName = user.user_metadata?.full_name || username;
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username,
              display_name: displayName,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
        }

        // Set session cookie
        if (session) {
          cookieStore.set('sb-access-token', session.access_token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
          });
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      // Redirect to sign-in page with error
      return NextResponse.redirect(new URL('/signin?error=auth', requestUrl.origin));
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
