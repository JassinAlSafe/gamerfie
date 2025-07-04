import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export interface AuthResult {
  user: {
    id: string;
    email?: string;
  };
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