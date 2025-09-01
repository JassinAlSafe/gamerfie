"use client";

import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';
import type { AuthResponse, Session } from '@supabase/supabase-js';
import type { 
  User, 
  Profile, 
  GoogleAuthResponse,
  AuthErrorDetails
} from '@/types/auth.types';
import { createAuthError } from '@/lib/auth-errors';
import { fetchUserProfileOptimized, ProfileCache } from '@/lib/auth-optimization';
import { performLogout } from '@/lib/auth-logout';
import { validateSession, getSafeUserData } from '@/lib/auth-session-validation';
import { QueryClient } from '@tanstack/react-query';

// =============================================================================
// CONFIGURATION - All constants in one place
// =============================================================================

const AUTH_CONFIG = {
  SESSION_CHECK_INTERVAL: 10 * 60 * 1000, // 10 minutes
  INITIALIZATION_TIMEOUT: 8000, // 8 seconds (reduced from 10)
  PROFILE_LOAD_TIMEOUT: 3000, // 3 seconds for profile loading
} as const;

const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
} as const;

// =============================================================================
// TYPE DEFINITIONS - Comprehensive interfaces
// =============================================================================

interface AuthInitialState {
  // Core auth state
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  isProfileLoading: boolean;
  
  // Error state
  error: AuthErrorDetails | null;
}

interface AuthActions {
  // Initialization
  initialize: () => Promise<void>;
  
  // Authentication actions
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<GoogleAuthResponse>;
  signOut: (scope?: 'global' | 'local' | 'others', queryClient?: QueryClient, onNavigate?: () => void) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  checkUser: () => Promise<void>;
  
  // Profile management
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  
  // Password management
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  
  // State management
  clearError: () => void;
  clearCache: () => void;
  
  // Auth state monitoring
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => { unsubscribe: () => void };
}

type AuthStore = AuthInitialState & AuthActions;

// =============================================================================
// UTILITY FUNCTIONS - Pure business logic
// =============================================================================

const createUserWithProfile = (user: any, profile: Profile | null): User => ({
  ...user,
  profile,
});

const shouldRefreshProfile = (user: User | null): boolean => {
  if (!user?.profile) return true;
  
  const lastUpdate = new Date(user.profile.updated_at || 0);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return lastUpdate < fiveMinutesAgo;
};

// =============================================================================
// OPTIMIZED AUTH STORE - Using combine middleware
// =============================================================================

const initialState: AuthInitialState = {
  user: null,
  profile: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  isProfileLoading: false,
  error: null,
};

export const useAuthStoreOptimized = create<AuthStore>()(
  combine(
    initialState,
    (set, get) => {
        const supabase = createClient();
        let authListener: { unsubscribe: () => void } | null = null;
        let isInitializing = false;

        // =================================================================
        // PRIVATE HELPER FUNCTIONS
        // =================================================================

        const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
          try {
            return await fetchUserProfileOptimized(userId);
          } catch (error) {
            console.warn('Profile fetch failed:', error);
            return null;
          }
        };

        const updateUserWithProfile = async (user: any, loadProfile = true): Promise<void> => {
          if (!loadProfile) {
            set({ user: createUserWithProfile(user, null) });
            return;
          }

          // Set user immediately for instant UI feedback
          set({ user: createUserWithProfile(user, null), isProfileLoading: true });

          // Load profile in background
          try {
            const profile = await Promise.race([
              fetchUserProfile(user.id),
              new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Profile load timeout')), AUTH_CONFIG.PROFILE_LOAD_TIMEOUT)
              )
            ]);

            set(state => ({
              user: state.user ? createUserWithProfile(state.user, profile) : null,
              isProfileLoading: false
            }));
          } catch (error) {
            console.warn('Profile loading timeout or error:', error);
            set({ isProfileLoading: false });
          }
        };

        const setupAuthListener = (): void => {
          console.log('🔧 Setting up auth listener...', { hasExistingListener: !!authListener });
          
          if (authListener) {
            console.log('🗑️ Unsubscribing existing auth listener');
            authListener.unsubscribe();
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log(`🔒 Auth state change event: ${event}`, { 
                hasSession: !!session, 
                hasUser: !!session?.user,
                timestamp: new Date().toISOString(),
                isInitialized: get().isInitialized
              });

              // FIXED: Only process events after initialization to prevent race conditions
              if (!get().isInitialized && event !== AUTH_EVENTS.SIGNED_OUT) {
                console.log('🔄 Skipping auth event processing - not yet initialized');
                return;
              }

              try {
                switch (event) {
                  case AUTH_EVENTS.SIGNED_IN:
                    if (session?.user) {
                      await updateUserWithProfile(session.user);
                      set({ session, error: null, isInitialized: true });
                    }
                    break;

                  case AUTH_EVENTS.SIGNED_OUT:
                    console.log(`🚪 SIGNED_OUT event received - clearing auth state`);
                    set({ 
                      user: null, 
                      profile: null, 
                      session: null, 
                      error: null,
                      isProfileLoading: false 
                    });
                    ProfileCache.clear();
                    console.log(`✅ Auth state cleared after SIGNED_OUT`);
                    break;

                  case AUTH_EVENTS.TOKEN_REFRESHED:
                    if (session?.user) {
                      const currentUser = get().user;
                      // Only update if we need to refresh profile or don't have one
                      if (shouldRefreshProfile(currentUser)) {
                        await updateUserWithProfile(session.user);
                      }
                      set({ session });
                    }
                    break;

                  case AUTH_EVENTS.USER_UPDATED:
                    if (session?.user) {
                      await updateUserWithProfile(session.user);
                      set({ session });
                    }
                    break;
                }
              } catch (error) {
                console.error(`Auth event ${event} processing failed:`, error);
                // Don't clear the entire state on event processing errors
                // Just log the error for debugging
              }
            }
          );

          authListener = { unsubscribe: () => subscription.unsubscribe() };
          console.log('✅ Auth listener set up successfully');
        };

        // =================================================================
        // PUBLIC ACTIONS
        // =================================================================

        const actions: AuthActions = {
          initialize: async () => {
            // CRITICAL FIX: Always allow re-initialization to ensure fresh auth state
            // This is essential for proper logout/refresh behavior
            if (isInitializing) {
              console.log('🔄 Already initializing, skipping duplicate call');
              return;
            }

            console.log('🚀 Initializing auth...');
            isInitializing = true;
            set({ isLoading: true, error: null });

            try {
              // SECURITY FIX: Use getUser() instead of getSession() for proper server validation
              // getUser() validates token with Supabase server, preventing tampered session data
              console.log('🔐 Initializing with secure getUser() validation...');
              
              const userPromise = supabase.auth.getUser();
              const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Auth initialization timeout')), AUTH_CONFIG.INITIALIZATION_TIMEOUT)
              );

              const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]);

              if (error && !error.message?.includes('Auth session missing')) {
                console.warn('Auth initialization error:', error);
              }

              // Set initial state based on validated user
              if (user) {
                console.log('✅ Valid user found via server validation, loading profile...');
                await updateUserWithProfile(user);
                
                // Get session for storing (but user data comes from getUser validation)
                const { data: { session } } = await supabase.auth.getSession();
                set({ session });
              } else {
                console.log('❌ No valid user found via server validation');
                set({ user: null, session: null });
              }

              // FIXED: Setup auth listener AFTER initial session check
              // This ensures the listener doesn't override our initial state
              setupAuthListener();

            } catch (error) {
              console.warn('Auth initialization error:', error);
              set({ user: null, session: null });
            } finally {
              isInitializing = false;
              set({ isLoading: false, isInitialized: true });
            }
          },

          signIn: async (email: string, password: string) => {
            console.log('Starting sign in for:', email);
            set({ isLoading: true, error: null });

            try {
              const response = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (response.error) throw response.error;

              if (response.data.user) {
                console.log('Sign in successful, setting user...');
                // Optimistic update - show user immediately
                await updateUserWithProfile(response.data.user);
                set({ session: response.data.session, isInitialized: true });
              }

              return response;
            } catch (error) {
              console.error('Sign in error:', error);
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Sign in failed'), 
                'signin'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          signOut: async (scope = 'local', queryClient?: QueryClient, onNavigate?: () => void) => {
            console.log('🔓 Starting comprehensive sign out with scope:', scope);
            console.log('🔓 Current auth state before logout:', { 
              hasUser: !!get().user, 
              hasSession: !!get().session,
              isInitialized: get().isInitialized 
            });
            
            // Optimistic update - clear UI immediately for instant feedback
            set({ 
              user: null, 
              profile: null, 
              session: null, 
              isLoading: true, 
              error: null,
              isProfileLoading: false 
            });
            console.log('🔓 Optimistic UI update completed - state cleared');

            try {
              // Use comprehensive logout that handles both client and server
              await performLogout(scope, queryClient);

              // Clear profile cache
              ProfileCache.clear();

              console.log('Comprehensive logout completed successfully');
              
              // Use Next.js 14 navigation best practices
              // Call the navigation callback if provided (from useRouter)
              if (onNavigate) {
                console.log('🔄 Using Next.js router navigation...');
                onNavigate();
              } else if (typeof window !== 'undefined') {
                // Fallback for cases where navigation callback isn't provided
                console.log('🔄 Using fallback navigation to home...');
                window.location.replace('/');
              }
              
            } catch (error) {
              console.error('Comprehensive sign out error:', error);
              
              // Even if logout fails, keep UI cleared since user initiated logout
              // This prevents stuck authenticated states
              console.warn('Logout error occurred, but keeping UI cleared for safety');
              
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Sign out failed'), 
                'signout'
              );
              set({ error: authError });
              
              // Don't re-throw the error - let UI stay cleared
              // throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          signUp: async (email: string, password: string, username: string, displayName?: string) => {
            set({ isLoading: true, error: null });

            try {
              const userMetadata = {
                username,
                display_name: displayName || username,
              };

              const response = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: userMetadata,
                  emailRedirectTo: `${window.location.origin}/auth/callback`
                }
              });

              if (response.error) throw response.error;

              if (response.data.user) {
                // Create profile safely
                const { error: profileError } = await supabase.rpc(
                  'create_user_profile_safe',
                  {
                    user_id: response.data.user.id,
                    user_email: response.data.user.email,
                    user_metadata: { 
                      ...response.data.user.user_metadata, 
                      ...userMetadata 
                    }
                  }
                );

                if (profileError) {
                  console.warn('Profile creation failed:', profileError);
                }

                await updateUserWithProfile(response.data.user);
                set({ session: response.data.session, isInitialized: true });
              }

              return response;
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Sign up failed'), 
                'signup'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          signInWithGoogle: async () => {
            console.log('Starting Google OAuth...');
            set({ isLoading: true, error: null });

            try {
              const redirectUrl = `${window.location.origin}/auth/callback`;
              
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

              if (response.error) throw response.error;
              return response;
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Google sign in failed'), 
                'oauth'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          refreshSession: async () => {
            try {
              set({ isLoading: true, error: null });
              
              // SECURITY FIX: Use getUser() for server-side token validation instead of getSession()
              const { data: { user }, error } = await supabase.auth.getUser();
              
              if (error && !error.message?.includes('Auth session missing')) {
                throw error;
              }

              if (user) {
                await updateUserWithProfile(user);
                // Get session for storing (but validation was done via getUser)
                const { data: { session } } = await supabase.auth.getSession();
                set({ session });
              } else {
                set({ user: null, session: null });
              }
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Session refresh failed'), 
                'refresh'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          checkUser: async () => {
            if (!get().isInitialized) {
              await actions.initialize();
              return;
            }

            try {
              const { data: { user }, error } = await supabase.auth.getUser();
              
              if (error && !error.message?.includes('Auth session missing')) {
                console.warn('User check warning:', error);
              }

              if (user) {
                const currentUser = get().user;
                if (shouldRefreshProfile(currentUser)) {
                  await updateUserWithProfile(user);
                }
              } else {
                set({ user: null, session: null });
              }
            } catch (error) {
              if (error instanceof Error && !error.message?.includes('Auth session missing')) {
                console.warn('User check error:', error);
              }
              set({ user: null, session: null });
            }
          },

          updateProfile: async (profileData: Partial<Profile>) => {
            const user = get().user;
            if (!user) throw new Error('No user logged in');

            // Optimistic update
            const optimisticProfile = user.profile ? { ...user.profile, ...profileData } : null;
            set({ 
              user: createUserWithProfile(user, optimisticProfile),
              isLoading: true, 
              error: null 
            });

            try {
              const { error } = await supabase
                .from('profiles')
                .update({
                  ...profileData,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

              if (error) throw error;

              // Update with confirmed data
              const confirmedProfile = optimisticProfile ? {
                ...optimisticProfile,
                updated_at: new Date().toISOString()
              } : null;

              set({ 
                user: createUserWithProfile(user, confirmedProfile as Profile)
              });
            } catch (error) {
              // Rollback optimistic update
              set({ user });
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Profile update failed'), 
                'update'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          uploadAvatar: async (file: File) => {
            const user = get().user;
            if (!user) throw new Error('No user logged in');

            set({ isLoading: true, error: null });

            try {
              const fileExt = file.name.split('.').pop();
              const filePath = `${user.id}/avatar.${fileExt}`;

              const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

              await actions.updateProfile({ avatar_url: publicUrl });
              return publicUrl;
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Avatar upload failed'), 
                'upload'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          resetPassword: async (email: string) => {
            console.log('Starting password reset for:', email);
            set({ isLoading: true, error: null });

            try {
              const redirectUrl = `${window.location.origin}/auth/callback`;
              
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
              });

              if (error) throw error;
              console.log('Password reset email sent successfully');
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Password reset failed'), 
                'reset'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          updatePassword: async (newPassword: string) => {
            set({ isLoading: true, error: null });

            try {
              const { error } = await supabase.auth.updateUser({
                password: newPassword
              });

              if (error) throw error;
            } catch (error) {
              const authError = createAuthError(
                error instanceof Error ? error : new Error('Password update failed'), 
                'update'
              );
              set({ error: authError });
              throw error;
            } finally {
              set({ isLoading: false });
            }
          },

          clearError: () => {
            set({ error: null });
          },

          clearCache: () => {
            ProfileCache.clear();
          },

          onAuthStateChange: (callback) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
            return { 
              unsubscribe: () => {
                console.log('Unsubscribing from auth state changes');
                subscription.unsubscribe();
              }
            };
          },
        };

        return actions;
      }
  )
);

// =============================================================================
// PERFORMANCE-OPTIMIZED SELECTOR HOOKS
// =============================================================================

import { useShallow } from 'zustand/react/shallow';

// User and profile data (most common usage)
export const useAuthUser = () => 
  useAuthStoreOptimized(useShallow(state => ({ 
    user: state.user, 
    profile: state.profile,
    isProfileLoading: state.isProfileLoading
  })));

// Authentication status only
export const useAuthStatus = () => 
  useAuthStoreOptimized(useShallow(state => ({ 
    isLoading: state.isLoading, 
    isInitialized: state.isInitialized,
    error: state.error 
  })));

// Actions only (stable references)
export const useAuthActions = () => 
  useAuthStoreOptimized(useShallow(state => ({
    signIn: state.signIn,
    signUp: state.signUp,
    signOut: state.signOut,
    signInWithGoogle: state.signInWithGoogle,
    updateProfile: state.updateProfile,
    uploadAvatar: state.uploadAvatar,
    resetPassword: state.resetPassword,
    updatePassword: state.updatePassword,
    clearError: state.clearError,
    initialize: state.initialize,
    refreshSession: state.refreshSession,
    checkUser: state.checkUser
  })));

// Simple boolean check
export const useIsAuthenticated = () => 
  useAuthStoreOptimized(state => !!state.user);

// Session data
export const useAuthSession = () => 
  useAuthStoreOptimized(state => state.session);

// Error state only
export const useAuthError = () => 
  useAuthStoreOptimized(state => state.error);