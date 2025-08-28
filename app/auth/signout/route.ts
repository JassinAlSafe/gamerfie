import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, validateCSRFToken } from '@/lib/auth-security';

async function signoutHandler(request: NextRequest) {
  try {
    // Validate CSRF token for security
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !(await validateCSRFToken(request, csrfToken))) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    
    // Check if user is signed in before attempting signout
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // User is not signed in, but that's okay for logout
      return NextResponse.json({ success: true, message: 'Already signed out' });
    }
    
    // Sign out the user (this will clear server-side cookies)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Server-side signout error:', error);
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }
    
    // Return success without redirect for API calls
    return NextResponse.json({ 
      success: true, 
      message: 'Signed out successfully' 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Signout route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Export with rate limiting protection
export const POST = withRateLimit(signoutHandler);