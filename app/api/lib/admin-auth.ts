import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

/**
 * Server-side admin authentication following Supabase 2025 best practices
 * ALWAYS use getUser() for security - never trust getSession()
 */

export interface AdminUser {
  id: string;
  email?: string;
  role: string;
}

export type AdminAuthResult = 
  | { success: true; user: AdminUser; supabase: Awaited<ReturnType<typeof createClient>> }
  | { success: false; response: NextResponse };

/**
 * Validates admin access for API routes
 * Returns either admin user data or an error response
 */
export async function validateAdminApiAccess(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();
    
    // IMPORTANT: Use getUser() not getSession() for security
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('🚫 Admin API access denied - authentication failed');
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }
    
    // Verify admin role from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.log('🚫 Admin API access denied - not admin role', {
        userId: user.id,
        role: profile?.role
      });
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      };
    }
    
    console.log('✅ Admin API access granted for user:', user.id);
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role
      },
      supabase
    };
  } catch (error) {
    console.error('🚨 Admin authentication error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Validates admin access for Server Components
 * Redirects to home if not admin
 */
export async function validateAdminPageAccess(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    
    // IMPORTANT: Use getUser() not getSession() for security
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('🚫 Admin page access denied - no user');
      redirect('/');
    }
    
    // Verify admin role from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      console.log('🚫 Admin page access denied - not admin role', {
        userId: user.id,
        role: profile?.role
      });
      redirect('/');
    }
    
    console.log('✅ Admin page access granted for user:', user.id);
    
    return {
      id: user.id,
      email: user.email,
      role: profile.role
    };
  } catch (error) {
    console.error('🚨 Admin page authentication error:', error);
    redirect('/');
  }
}

/**
 * Quick admin check without redirect (for conditional rendering)
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // IMPORTANT: Use getUser() not getSession() for security
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    // Verify admin role from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return !profileError && profile?.role === 'admin';
  } catch (error) {
    console.error('🚨 Admin check error:', error);
    return false;
  }
}