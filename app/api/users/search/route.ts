import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface UserData {
  id: string;
  username: string;
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Searching for users with query:', query);
    console.log('Current user ID:', session.user.id);

    // Query the profiles table
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', session.user.id)
      .ilike('username', `%${query}%`)
      .limit(5);

    console.log('Search results:', users);
    if (error) {
      console.error('Search error details:', error);
      throw error;
    }
    if (!users) return NextResponse.json([]);

    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username
    }));

    console.log('Transformed results:', transformedUsers);
    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 