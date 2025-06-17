import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface ProfileDebugInfo {
  userId: string;
  userExists: boolean;
  profileExists: boolean;
  hasEmail: boolean;
  hasMetadata: boolean;
  profileData?: any;
  userData?: any;
  errors?: string[];
}

/**
 * Debug function to check user and profile status
 * Useful for troubleshooting profile-related issues
 */
export async function debugUserProfile(userId?: string): Promise<ProfileDebugInfo> {
  const supabase = createClient();
  const errors: string[] = [];
  
  try {
    let targetUser: User | null = null;
    
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        errors.push(`Auth error: ${error.message}`);
        return {
          userId: 'unknown',
          userExists: false,
          profileExists: false,
          hasEmail: false,
          hasMetadata: false,
          errors
        };
      }
      targetUser = user;
      userId = user?.id;
    }

    if (!userId) {
      errors.push('No user ID available');
      return {
        userId: 'unknown',
        userExists: false,
        profileExists: false,
        hasEmail: false,
        hasMetadata: false,
        errors
      };
    }

    // Check if user exists
    const userExists = !!targetUser;
    const hasEmail = !!(targetUser?.email);
    const hasMetadata = !!(targetUser?.user_metadata && Object.keys(targetUser.user_metadata).length > 0);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const profileExists = !!profile && !profileError;
    
    if (profileError && profileError.code !== 'PGRST116') {
      errors.push(`Profile fetch error: ${profileError.message}`);
    }

    return {
      userId,
      userExists,
      profileExists,
      hasEmail,
      hasMetadata,
      profileData: profile,
      userData: targetUser ? {
        id: targetUser.id,
        email: targetUser.email,
        created_at: targetUser.created_at,
        user_metadata: targetUser.user_metadata,
        app_metadata: targetUser.app_metadata
      } : null,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      userId: userId || 'unknown',
      userExists: false,
      profileExists: false,
      hasEmail: false,
      hasMetadata: false,
      errors
    };
  }
}

/**
 * Console log a formatted debug report for a user's profile status
 */
export async function logProfileDebug(userId?: string): Promise<void> {
  const debug = await debugUserProfile(userId);
  
  console.log('🔍 Profile Debug Report');
  console.log('======================');
  console.log(`User ID: ${debug.userId}`);
  console.log(`User Exists: ${debug.userExists ? '✅' : '❌'}`);
  console.log(`Profile Exists: ${debug.profileExists ? '✅' : '❌'}`);
  console.log(`Has Email: ${debug.hasEmail ? '✅' : '❌'}`);
  console.log(`Has Metadata: ${debug.hasMetadata ? '✅' : '❌'}`);
  
  if (debug.errors && debug.errors.length > 0) {
    console.log('❌ Errors:');
    debug.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (debug.userData) {
    console.log('👤 User Data:');
    console.log('   - Email:', debug.userData.email);
    console.log('   - Created:', debug.userData.created_at);
    console.log('   - Metadata:', JSON.stringify(debug.userData.user_metadata, null, 2));
  }
  
  if (debug.profileData) {
    console.log('👥 Profile Data:');
    console.log('   - Username:', debug.profileData.username);
    console.log('   - Display Name:', debug.profileData.display_name);
    console.log('   - Role:', debug.profileData.role);
    console.log('   - Created:', debug.profileData.created_at);
  }
  
  if (!debug.profileExists && debug.userExists) {
    console.log('💡 Suggestion: User exists but profile is missing. Consider calling ensureUserProfile()');
  }
}

/**
 * Quick check to see if current user needs profile creation
 */
export async function needsProfileCreation(): Promise<boolean> {
  const debug = await debugUserProfile();
  return debug.userExists && !debug.profileExists;
} 