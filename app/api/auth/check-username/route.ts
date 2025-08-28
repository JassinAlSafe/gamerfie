import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { withRateLimit, sanitizeInput } from '@/lib/auth-security';

async function checkUsernameHandler(request: NextRequest) {
  try {
    const { username: rawUsername } = await request.json();

    if (!rawUsername || typeof rawUsername !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Sanitize input to prevent injection attacks
    const username = sanitizeInput(rawUsername.trim());

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { available: false, reason: 'Username must be 3-20 characters' },
        { status: 200 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { available: false, reason: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 200 }
      );
    }

    // Check against reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'user', 'test', 'demo', 'api', 'www',
      'mail', 'email', 'support', 'help', 'info', 'contact', 'about', 'blog',
      'news', 'forum', 'gamevault', 'game-vault', 'staff', 'moderator', 'mod'
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json(
        { available: false, reason: 'This username is reserved' },
        { status: 200 }
      );
    }

    const supabase = await createClient();

    // Check if username already exists in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned (username is available)
      console.error('Database error checking username:', error);
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      );
    }

    const isAvailable = !data; // If no data returned, username is available

    return NextResponse.json({
      available: isAvailable,
      username: username.toLowerCase(),
      reason: isAvailable ? undefined : 'Username is already taken'
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export with rate limiting protection
export const POST = withRateLimit(checkUsernameHandler);