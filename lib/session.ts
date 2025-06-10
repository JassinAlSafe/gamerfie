import { createClient } from '@/utils/supabase/server';
import { type User } from '@supabase/supabase-js';

export async function getSession(): Promise<{ user: User } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { user } : null;
} 