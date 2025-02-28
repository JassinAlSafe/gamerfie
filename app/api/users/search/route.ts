import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define the UserData interface directly
interface UserData {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ users: [] });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Searching for users with query:', query);
    console.log('Current user ID:', session.user.id);

    // Query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .ilike('username', `%${query}%`)
      .limit(10);

    console.log('Search results:', data);
    if (error) {
      console.error('Search error details:', error);
      throw error;
    }
    if (!data) return NextResponse.json({ users: [] });

    // Use the UserData interface for the response
    const users: UserData[] = data || [];
    return NextResponse.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 