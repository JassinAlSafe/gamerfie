import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Simple logout route that clears server-side cookies
 * Following Supabase's latest Next.js patterns
 */
export async function POST(_request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = await createClient();
    
    // Clear the session on the server side
    // This will clear all auth-related cookies
    await supabase.auth.signOut();
    
    // Additional cookie cleanup for any remaining auth cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Clear any Supabase-related cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Server-side logout completed' 
    });

    // Clear auth cookies by setting them to expire
    allCookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
        response.cookies.set({
          name: cookie.name,
          value: '',
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
    });

    // Force no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
    
  } catch (error) {
    console.error('Server-side logout error:', error);
    
    // Even if there's an error, still try to clear cookies
    const response = NextResponse.json(
      { success: false, error: 'Logout error, but cookies cleared' },
      { status: 500 }
    );

    // Force clear common auth cookies
    const authCookies = [
      'supabase-auth-token',
      'sb-access-token', 
      'sb-refresh-token',
      'supabase.auth.token'
    ];

    authCookies.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  }
}