import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthResponse, isSupabaseError } from "../types/auth";

const supabase = createClientComponentClient();

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
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            username: userData.username,
            display_name: userData.display_name,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("No user returned after signup");

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...userData,
        });

      if (profileError) throw profileError;

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error) ? error.message : "Failed to create account",
        },
      };
    }
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: isSupabaseError(error) ? error.message : "Failed to sign in with Google",
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