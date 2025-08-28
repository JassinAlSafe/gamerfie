/**
 * Authentication Performance Optimizations
 * Smart user detection, caching, and optimized flows
 */

import { createClient } from '@/utils/supabase/client';
import type { Profile } from '@/types/auth.types';

export interface UserDetectionResult {
  exists: boolean;
  hasProfile: boolean;
  provider?: string;
  lastSignIn?: string;
  needsEmailVerification?: boolean;
}

/**
 * Check if a user exists without triggering authentication
 * This helps users understand if they should sign in vs sign up
 */
export async function detectExistingUser(email: string): Promise<UserDetectionResult> {
  const supabase = createClient();
  
  try {
    // Use a special query to check user existence
    const { data, error } = await supabase.rpc('check_user_exists', { 
      user_email: email 
    });
    
    if (error) {
      console.warn('User detection failed:', error);
      return { exists: false, hasProfile: false };
    }
    
    return data as UserDetectionResult;
  } catch (error) {
    console.warn('User detection error:', error);
    return { exists: false, hasProfile: false };
  }
}

/**
 * Smart authentication strategy based on user state
 */
export function getAuthStrategy(detection: UserDetectionResult) {
  if (!detection.exists) {
    return {
      action: 'signup',
      message: 'Create your account',
      priority: 'primary'
    };
  }
  
  if (detection.needsEmailVerification) {
    return {
      action: 'verify',
      message: 'Please verify your email first',
      priority: 'warning'
    };
  }
  
  if (detection.provider === 'google') {
    return {
      action: 'google',
      message: 'Continue with Google',
      priority: 'social'
    };
  }
  
  return {
    action: 'signin',
    message: 'Welcome back! Sign in to continue',
    priority: 'primary'
  };
}

/**
 * Cache user profile data for faster subsequent loads
 */
export class ProfileCache {
  private static cache = new Map<string, Profile>();
  private static expiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static set(userId: string, profile: Profile): void {
    this.cache.set(userId, profile);
    this.expiry.set(userId, Date.now() + this.CACHE_DURATION);
  }

  static get(userId: string): Profile | null {
    const expiry = this.expiry.get(userId);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(userId);
      this.expiry.delete(userId);
      return null;
    }
    return this.cache.get(userId) ?? null;
  }

  static clear(): void {
    this.cache.clear();
    this.expiry.clear();
  }
}

/**
 * Optimized profile fetching with caching and auto-creation
 */
export async function fetchUserProfileOptimized(userId: string): Promise<Profile | null> {
  // Check cache first
  const cached = ProfileCache.get(userId);
  if (cached) {
    return cached;
  }

  const supabase = createClient();
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, try to create one using the database function
      console.log('Profile not found for user:', userId, 'attempting to create...');
      
      try {
        // Get user data to pass to the creation function
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id === userId) {
          // Call the database function to create profile safely
          const { error: createError } = await supabase.rpc(
            'create_user_profile_safe',
            {
              user_id: userId,
              user_email: user.email,
              user_metadata: user.user_metadata || {}
            }
          );
          
          if (createError) {
            console.warn('Profile creation failed:', createError);
            return null;
          }
          
          // Now fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (!fetchError && newProfile) {
            ProfileCache.set(userId, newProfile);
            return newProfile;
          }
        }
      } catch (createError) {
        console.warn('Profile auto-creation failed:', createError);
      }
      
      return null;
    }
    
    if (error) {
      console.warn('Profile fetch error:', error);
      return null;
    }
    
    // Cache the result
    ProfileCache.set(userId, profile);
    return profile;
  } catch (error) {
    console.warn('Profile fetch failed:', error);
    return null;
  }
}

/**
 * Pre-warm authentication state on app load
 */
export async function preWarmAuth(): Promise<{
  isAuthenticated: boolean;
  user: any | null;
  needsProfileFetch: boolean;
}> {
  const supabase = createClient();
  
  try {
    // Check if user is already signed in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Pre-fetch profile in background
      fetchUserProfileOptimized(session.user.id);
      return {
        isAuthenticated: true,
        user: session.user,
        needsProfileFetch: false
      };
    }
    
    return {
      isAuthenticated: false,
      user: null,
      needsProfileFetch: false
    };
  } catch (error) {
    console.warn('Auth pre-warm failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      needsProfileFetch: false
    };
  }
}

/**
 * Smart redirect logic based on user state and intended destination
 */
export function getSmartRedirect(user: { profile?: Profile | null }, intendedPath?: string): string {
  if (!user) {
    return '/signin';
  }
  
  // Only send to welcome if user specifically hasn't completed onboarding
  // (not for missing profile data - that should be handled differently)
  const settings = user.profile?.settings;
  const onboardedStatus = settings && typeof settings === 'object' && 'onboarded' in settings 
    ? settings.onboarded 
    : undefined;
  if (onboardedStatus === false) {
    return '/welcome?new=true';
  }
  
  // If user has incomplete profile but onboarding is true/undefined, go to home
  // The profile completion can be handled on the main page
  if (!user.profile?.display_name || !user.profile?.username) {
    return '/?profile_incomplete=true';
  }
  
  // Return to intended path or default home
  return intendedPath || '/';
}

/**
 * Batch update user data for performance
 */
export async function batchUpdateUserData(userId: string, updates: {
  profile?: any;
  preferences?: any;
  settings?: any;
}) {
  const supabase = createClient();
  const promises = [];
  
  if (updates.profile) {
    promises.push(
      supabase
        .from('profiles')
        .update(updates.profile)
        .eq('id', userId)
    );
  }
  
  if (updates.preferences) {
    promises.push(
      supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...updates.preferences })
    );
  }
  
  if (updates.settings) {
    promises.push(
      supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...updates.settings })
    );
  }
  
  try {
    await Promise.all(promises);
    
    // Update cache
    if (updates.profile) {
      const currentProfile = ProfileCache.get(userId);
      if (currentProfile) {
        ProfileCache.set(userId, { ...currentProfile, ...updates.profile });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Batch update failed:', error);
    return { success: false, error };
  }
}