import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CreateProfileOptions {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Ensures a user has a profile, creating one if necessary
 */
export async function ensureUserProfile(
  user: User, 
  options?: CreateProfileOptions
): Promise<Profile | null> {
  const supabase = createClient();

  try {
    // First, check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile exists, return it
    if (existingProfile && !fetchError) {
      return existingProfile;
    }

    // If we get an error other than "no rows", something's wrong
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', fetchError);
      return null;
    }

    // Profile doesn't exist, create one
    const username = options?.username || 
                    user.email?.split('@')[0] || 
                    `user_${user.id.slice(0, 8)}`;
    
    const displayName = options?.displayName ||
                       user.user_metadata?.display_name ||
                       user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       username;

    const avatarUrl = options?.avatarUrl ||
                     user.user_metadata?.avatar_url ||
                     user.user_metadata?.picture ||
                     null;

    const profileData = {
      id: user.id,
      username,
      display_name: displayName,
      bio: options?.bio || null,
      avatar_url: avatarUrl,
      email: user.email || null,
      role: 'user' as const,
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return null;
  }
}

/**
 * Gets a user profile by ID, creating one if it doesn't exist
 */
export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  try {
    // First try to get the profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && !error) {
      return profile;
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Profile doesn't exist, we need the user data to create it
    // This function assumes the profile should exist, so log a warning
    console.warn(`Profile not found for user ${userId}. Consider using ensureUserProfile with user data.`);
    
    return null;
  } catch (error) {
    console.error('Unexpected error in getOrCreateProfile:', error);
    return null;
  }
}

/**
 * Validates if a profile has all required fields
 */
export function validateProfile(profile: Partial<Profile>): string[] {
  const errors: string[] = [];

  if (!profile.id) errors.push('Profile ID is required');
  if (!profile.username) errors.push('Username is required');
  if (!profile.display_name) errors.push('Display name is required');

  return errors;
}

/**
 * Generates a unique username from email or user metadata
 */
export function generateUsername(user: User): string {
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  if (user.user_metadata?.username) {
    return user.user_metadata.username;
  }

  return `user_${user.id.slice(0, 8)}`;
}

/**
 * Extracts display name from user metadata with fallbacks
 */
export function extractDisplayName(user: User, fallbackUsername?: string): string {
  return user.user_metadata?.display_name ||
         user.user_metadata?.full_name ||
         user.user_metadata?.name ||
         user.user_metadata?.username ||
         fallbackUsername ||
         generateUsername(user);
} 