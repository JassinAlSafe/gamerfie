import { create } from 'zustand'
import type { User as SupabaseUser, AuthResponse } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type User = SupabaseUser & {
  profile?: Profile | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  
  // Auth Actions
  setUser: (_user: User | null) => void
  setLoading: (_isLoading: boolean) => void
  setError: (_error: string | null) => void
  signIn: (_email: string, _password: string) => Promise<AuthResponse>
  signUp: (_email: string, _password: string, _username: string) => Promise<AuthResponse>
  signInWithGoogle: () => Promise<{ data: { provider: string; url: string } | null; error: any }>
  signOut: () => Promise<void>
  resetPassword: (_email: string) => Promise<void>
  updatePassword: (_newPassword: string) => Promise<void>

  // Session Management
  checkUser: () => Promise<void>
  refreshSession: () => Promise<void>
  initialize: () => Promise<void>

  // Profile Management
  updateProfile: (_profile: Partial<Profile>) => Promise<void>
  uploadAvatar: (_file: File) => Promise<string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const supabase = createClient()

      const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.warn('Error fetching profile:', error);
            return null;
          }
          
          return profile;
        } catch (error) {
          console.warn('Failed to fetch user profile:', error);
          return null;
        }
      };

      return {
        user: null,
        isLoading: false, // Start with false to prevent infinite loading
        error: null,
        isInitialized: false,

        // State setters
        setUser: (_user) => set({ user: _user }),
        setLoading: (_isLoading) => set({ isLoading: _isLoading }),
        setError: (_error) => set({ error: _error }),
        
        initialize: async () => {
          const currentState = get();
          if (currentState.isInitialized) return;
          
          const initWithTimeout = async () => {
            set({ isLoading: true, error: null });
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              
              // If no profile exists, create one
              if (!profile) {
                const username = session.user.email?.split('@')[0] || 'user';
                const displayName = session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || username;
                const { data: newProfile, error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    username,
                    display_name: displayName,
                    email: session.user.email || null,
                    avatar_url: session.user.user_metadata?.avatar_url,
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .select()
                  .single();

                if (insertError) {
                  console.warn('Failed to create profile:', insertError);
                }

                set({ 
                  user: { ...session.user, profile: newProfile || null },
                  error: null 
                });
              } else {
                set({ 
                  user: { ...session.user, profile },
                  error: null 
                });
              }
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
            set({ isLoading: true, error: null });
            const response = await supabase.auth.signInWithPassword({
              email: _email,
              password: _password,
            });
            
            if (response.error) throw response.error;
            
            if (response.data.user) {
              const profile = await fetchUserProfile(response.data.user.id);

              set({ 
                user: { ...response.data.user, profile: profile || null },
                error: null 
              });
            }
            
            return response;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign in';
            set({ error: message });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signUp: async (_email, _password, _username) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await supabase.auth.signUp({
              email: _email,
              password: _password,
              options: {
                data: {
                  username: _username
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
              }
            });
            
            if (response.error) throw response.error;

            if (response.data.user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: response.data.user.id,
                  username: _username,
                  display_name: _username,
                  email: response.data.user.email || null,
                  role: 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (profileError) {
                console.warn('Failed to create profile during signup:', profileError);
              }

              const newProfile: Profile = {
                id: response.data.user.id,
                username: _username,
                display_name: _username,
                bio: null,
                avatar_url: null,
                email: response.data.user.email || null,
                settings: null,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              set({ 
                user: { 
                  ...response.data.user, 
                  profile: newProfile
                },
                error: null 
              });
            }

            return response;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign up';
            set({ error: message });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signOut: async () => {
          try {
            set({ isLoading: true, error: null });
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            set({ user: null });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign out';
            set({ error: message });
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
            set({ isLoading: true, error: null });
            const { error } = await supabase.auth.resetPasswordForEmail(_email);
            if (error) throw error;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset password';
            set({ error: message });
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
            const message = error instanceof Error ? error.message : 'Failed to update password';
            set({ error: message });
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
            const message = error instanceof Error ? error.message : 'Failed to refresh session';
            set({ error: message });
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
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            set({ error: message });
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
            const message = error instanceof Error ? error.message : 'Failed to upload avatar';
            set({ error: message });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        signInWithGoogle: async () => {
          try {
            set({ isLoading: true, error: null });
            
            // Determine the correct redirect URL based on environment
            const isDev = process.env.NODE_ENV === 'development';
            const baseUrl = isDev ? 'http://localhost:3000' : window.location.origin;
            
            const response = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${baseUrl}/auth/callback`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            });

            if (response.error) throw response.error;

            // For OAuth flows, we return the response as-is since the redirect handles the auth
            return response;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
            set({ error: message });
            throw error;
          } finally {
            set({ isLoading: false });
          }
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