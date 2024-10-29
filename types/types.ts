import { User as SupabaseUser } from '@supabase/auth-js';

export interface User extends SupabaseUser {
  name: string;
}