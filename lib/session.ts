import { createClient } from '@/utils/supabase/server';
import { type Session } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
} 