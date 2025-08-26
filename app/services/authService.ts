import { createClient } from "@/utils/supabase/client";
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

interface AuthError {
  message: string;
  code?: string;
}

interface AuthResponse {
  success: boolean;
  data?: User | { provider: string; url: string };
  error?: AuthError;
}

function isSupabaseError(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string';
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
        data: data.user || undefined,
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
        data: data.user || undefined,
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