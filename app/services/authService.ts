import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface AuthError {
  message: string;
  code?: string;
}

interface AuthResponse {
  success: boolean;
  data?: any;
  error?: AuthError;
}

function isSupabaseError(error: any): error is { message: string } {
  return error && typeof error.message === 'string';
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        data: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error) ? error.message : "Failed to sign in",
        },
      };
    }
  },

  async signUp(
    email: string,
    password: string,
    userData: {
      username: string;
      display_name: string;
      date_of_birth: string;
      preferred_platform: string;
    }
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            display_name: userData.display_name,
            date_of_birth: userData.date_of_birth,
            preferred_platform: userData.preferred_platform,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            username: userData.username,
            display_name: userData.display_name,
            bio: null,
            avatar_url: null,
            date_of_birth: userData.date_of_birth,
            preferred_platform: userData.preferred_platform,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail the signup, profile can be created later
        }
      }

      return {
        success: true,
        data: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error) ? error.message : "Failed to sign up",
        },
      };
    }
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error)
            ? error.message
            : "Failed to sign in with Google",
        },
      };
    }
  },

  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error) ? error.message : "Failed to sign out",
        },
      };
    }
  },
}; 