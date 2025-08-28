import { create } from 'zustand'
import type { AuthResponse, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { persist } from 'zustand/middleware'
import { fetchUserProfileOptimized, ProfileCache, preWarmAuth } from '@/lib/auth-optimization'
import type { 
  User, 
  Profile, 
  GoogleAuthResponse,
  AuthErrorDetails
} from '@/types/auth.types'
import { createAuthError } from '@/lib/auth-errors'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  error: AuthErrorDetails | null
  isInitialized: boolean
  
  // Auth Actions
  setUser: (_user: User | null) => void
  setLoading: (_isLoading: boolean) => void
  setError: (_error: AuthErrorDetails | null) => void
  signIn: (_email: string, _password: string) => Promise<AuthResponse>
  signUp: (_email: string, _password: string, _username: string, _displayName?: string) => Promise<AuthResponse>
  signInWithGoogle: () => Promise<GoogleAuthResponse>
  signOut: (_scope?: 'global' | 'local' | 'others') => Promise<void>
  resetPassword: (_email: string) => Promise<void>
  updatePassword: (_newPassword: string) => Promise<void>

  // Session Management
  checkUser: () => Promise<void>
  refreshSession: () => Promise<void>
  initialize: () => Promise<void>

  // Profile Management
  updateProfile: (_profile: Partial<Profile>) => Promise<void>
  uploadAvatar: (_file: File) => Promise<string>
  
  // Auth State Monitoring
  onAuthStateChange: (_callback: (event: string, session: Session | null) => void) => { unsubscribe: () => void }
  
  // Performance Optimizations
  preWarmAuth: () => Promise<void>
  clearCache: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const supabase = createClient()

      const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
        // Use optimized caching version
        return await fetchUserProfileOptimized(userId);
      };

      return {
        user: null,
        session: null,
        profile: null,
        isLoading: false, // Start with false to prevent infinite loading
        error: null,
        isInitialized: false,

        // State setters
        setUser: (_user) => set({ user: _user }),
        setLoading: (_isLoading) => set({ isLoading: _isLoading }),
        setError: (_error) => set({ error: _error }),
        
        initialize: async () => {
          const currentState = get();
          if (currentState.isInitialized) {
            console.log('Auth already initialized, skipping');
            return;
          }
          
          const initWithTimeout = async () => {
            console.log('Starting auth initialization...');
            set({ isLoading: true, error: null });
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            console.log('Auth session:', { hasSession: !!session, hasUser: !!session?.user, error: sessionError });
            
            if (sessionError) throw sessionError;
            
            if (session?.user) {
              console.log('Fetching user profile for:', session.user.id);
              const profile = await fetchUserProfile(session.user.id);
              
              const userData = { ...session.user, profile: profile || null };
              console.log('Setting user data:', { userId: userData.id, hasProfile: !!profile });
              
              set({ 
                user: userData,
                error: null 
              });
            } else {
              console.log('No session found, user is not authenticated');
              set({ user: null });
            }
          };

          try {
            // Add timeout to prevent infinite loading
            const timeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth initialization timeout after 10 seconds')), 10000)
            );
            
            await Promise.race([initWithTimeout(), timeout]);
          } catch (error) {
            console.warn('Session initialization error or timeout:', error);
            set({ user: null });
          } finally {
            set({ isLoading: false, isInitialized: true });
          }
        },

        // Auth actions
        signIn: async (_email, _password) => {
          try {
            console.log('Auth store: Starting signin for:', _email);
            set({ isLoading: true, error: null });
            const response = await supabase.auth.signInWithPassword({
              email: _email,
              password: _password,
            });
            
            console.log('Auth store: Signin response:', response);
            
            if (response.error) {
              console.error('Auth store: Signin error:', response.error);
              
              // For email not confirmed, don't set generic error in store
              if (response.error.message === "Email not confirmed") {
                // Let the component handle this specific error
                throw response.error;
              }
              
              throw response.error;
            }
            
            if (response.data.user) {
              console.log('Auth store: User signed in, fetching profile...');
              const profile = await fetchUserProfile(response.data.user.id);

              set({ 
                user: { ...response.data.user, profile: profile || null },
                error: null,
                isInitialized: true // Ensure initialized flag is set after successful sign-in
              });
              console.log('Auth store: Signin complete');
            }
            
            return response;
          } catch (error) {
            console.error('Auth store: Signin caught error:', error);
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to sign in'), 'signin');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signUp: async (_email, _password, _username, _displayName) => {
          try {
            set({ isLoading: true, error: null });
            
            // Prepare user metadata following Supabase best practices
            const userMetadata = {
              username: _username,
              display_name: _displayName || _username, // Use display_name if provided, fallback to username
            };
            
            const response = await supabase.auth.signUp({
              email: _email,
              password: _password,
              options: {
                data: userMetadata,
                emailRedirectTo: `${window.location.origin}/auth/callback`
              }
            });
            
            if (response.error) throw response.error;

            if (response.data.user) {
              // Use the safe profile creation function with proper metadata
              const { error: profileError } = await supabase.rpc(
                'create_user_profile_safe',
                {
                  user_id: response.data.user.id,
                  user_email: response.data.user.email,
                  user_metadata: { 
                    ...response.data.user.user_metadata, 
                    ...userMetadata  // Ensure our metadata is included
                  }
                }
              );

              if (profileError) {
                console.warn('Failed to create profile during signup:', profileError);
              }

              // Fetch the created profile
              const profile = await fetchUserProfile(response.data.user.id);

              set({ 
                user: { 
                  ...response.data.user, 
                  profile: profile || null
                },
                error: null,
                isInitialized: true // Ensure initialized flag is set after successful sign-up
              });
            }

            return response;
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to sign up'), 'signup');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signOut: async (scope: 'global' | 'local' | 'others' = 'local') => {
          try {
            set({ isLoading: true, error: null });
            
            // Sign out with specified scope (default to 'local' for better UX)
            const { error } = await supabase.auth.signOut({ scope });
            if (error) throw error;
            
            // Clear local state
            set({ user: null });
            
            // Clear profile cache
            ProfileCache.clear();
            
            // For SSR compatibility, also call server-side signout
            // This ensures cookies are properly cleared on the server
            try {
              await fetch('/auth/signout', { 
                method: 'POST',
                credentials: 'same-origin' // Include cookies
              });
            } catch (serverError) {
              // Server-side signout failed, but client-side succeeded
              console.warn('Server-side signout failed:', serverError);
            }
            
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to sign out'), 'reset');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        checkUser: async () => {
          if (!get().isInitialized) {
            await get().initialize();
            return;
          }

          try {
            // Use getUser() instead of getSession() for security
            const { data: { user }, error } = await supabase.auth.getUser();
            
            // Only log meaningful errors, not auth session missing errors
            if (error && !error.message?.includes('Auth session missing')) {
              console.warn('Auth check warning:', error);
            }

            if (user) {
              const profile = await fetchUserProfile(user.id);

              set({ 
                user: { ...user, profile: profile || null },
                error: null 
              });
            } else {
              set({ user: null, error: null });
            }
          } catch (error) {
            // Only log meaningful errors, not expected auth session missing errors
            if (error instanceof Error && !error.message?.includes('Auth session missing')) {
              console.warn('Auth check warning:', error);
            }
            set({ user: null });
          }
        },

        resetPassword: async (_email) => {
          try {
            console.log('Auth store: Starting password reset for:', _email);
            set({ isLoading: true, error: null });
            
            // Use auth callback URL for proper token handling
            const redirectUrl = `${window.location.origin}/auth/callback`;
            console.log('Auth store: Reset password redirect URL:', redirectUrl);
            console.log('Auth store: Current origin:', window.location.origin);
            
            const { error } = await supabase.auth.resetPasswordForEmail(_email, {
              redirectTo: redirectUrl
            });
            
            if (error) {
              console.error('Auth store: Password reset error:', error);
              throw error;
            }
            
            console.log('Auth store: Password reset email sent successfully');
          } catch (error) {
            console.error('Auth store: Password reset caught error:', error);
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to send reset email'), 'reset');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updatePassword: async (_newPassword) => {
          try {
            set({ isLoading: true, error: null });
            const { error } = await supabase.auth.updateUser({
              password: _newPassword
            });
            if (error) throw error;
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to update password'), 'update');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        refreshSession: async () => {
          try {
            set({ isLoading: true, error: null });
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);

              set({ 
                user: { ...session.user, profile: profile || null },
                error: null 
              });
            } else {
              set({ user: null, error: null });
            }
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to refresh session'), 'signin');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        // Profile management
        updateProfile: async (_profile) => {
          try {
            const user = get().user;
            if (!user) throw new Error('No user logged in');

            set({ isLoading: true, error: null });
            const { error } = await supabase
              .from('profiles')
              .update({
                ..._profile,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);

            if (error) throw error;

            // Update local state
            if (!user.profile) throw new Error('No profile found');
            
            set({ 
              user: { 
                ...user, 
                profile: { 
                  ...user.profile,  // Base profile with all required fields
                  ..._profile,      // New partial updates
                  updated_at: new Date().toISOString() 
                } as Profile
              } 
            });
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to update profile'), 'update');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        uploadAvatar: async (_file) => {
          try {
            const user = get().user;
            if (!user) throw new Error('No user logged in');

            set({ isLoading: true, error: null });
            
            const fileExt = _file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload file
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, _file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);

            // Update profile with new avatar URL
            await get().updateProfile({ avatar_url: publicUrl });

            return publicUrl;
          } catch (error) {
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to upload avatar'), 'update');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signInWithGoogle: async () => {
          try {
            console.log('Auth store: Starting Google OAuth...');
            set({ isLoading: true, error: null });
            
            // Determine the correct redirect URL based on environment
            const redirectUrl = `${window.location.origin}/auth/callback`;
            
            console.log('Auth store: Redirect URL:', redirectUrl);
            
            const response = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: redirectUrl,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'select_account',
                },
              },
            });

            console.log('Auth store: OAuth response:', response);

            if (response.error) {
              console.error('Auth store: OAuth error:', response.error);
              throw new Error(`Google authentication failed: ${response.error.message}`);
            }

            // For OAuth flows, we return the response as-is since the redirect handles the auth
            return response;
          } catch (error) {
            console.error('Auth store: Caught error:', error);
            const authError = createAuthError(error instanceof Error ? error : new Error('Failed to sign in with Google'), 'oauth');
            set({ error: authError });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        // Performance optimizations
        preWarmAuth: async () => {
          try {
            const result = await preWarmAuth();
            if (result.isAuthenticated && result.user) {
              set({ user: result.user, isInitialized: true });
            }
          } catch (error) {
            console.warn('Pre-warm auth failed:', error);
          }
        },

        clearCache: () => {
          ProfileCache.clear();
        },

        // Auth state monitoring
        onAuthStateChange: (callback) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
          return { 
            unsubscribe: () => {
              console.log('Auth store: Unsubscribing from auth state changes');
              subscription.unsubscribe();
            }
          };
        }
      }
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized 
      })
    }
  )
) 