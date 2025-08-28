import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Discriminated union for authentication results
export type AuthenticationResult = 
  | { success: true; user: AuthUser; supabase: Awaited<ReturnType<typeof createClient>> }
  | { success: false; response: NextResponse };

export interface AuthUser {
  id: string;
  email?: string;
}

// Legacy interface for backward compatibility
export interface AuthResult {
  user: AuthUser;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export async function authenticateRequest(): Promise<AuthResult | NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth user error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return {
      user: {
        id: user.id,
        email: user.email
      },
      supabase
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function isAuthResult(result: AuthResult | NextResponse): result is AuthResult {
  return 'user' in result;
}

/**
 * Modern authentication function using discriminated unions
 * This provides better type safety and eliminates the need for type guards
 */
export async function authenticateRequestSafe(): Promise<AuthenticationResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth user error:', error);
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        )
      };
    }
    
    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      supabase
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    };
  }
}