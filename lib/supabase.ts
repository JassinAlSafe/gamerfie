import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>;

  public static getInstance() {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: 'gamerfie-auth',
        },
      });
    }
    return SupabaseClient.instance;
  }
}

export const supabase = SupabaseClient.getInstance(); 