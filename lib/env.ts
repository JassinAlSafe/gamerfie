/**
 * Environment variable validation utility
 * Ensures required environment variables are present and throws helpful errors if not
 */

export interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // External APIs
  RAWG_API_KEY: string; // Server-side only for security
  NEXT_PUBLIC_TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;
  
  // NextAuth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  AUTH_SECRET: string;
  
  // Optional
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_API_BASE?: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironment(): EnvConfig {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RAWG_API_KEY',
    'NEXT_PUBLIC_TWITCH_CLIENT_ID',
    'TWITCH_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'AUTH_SECRET',
  ];

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value) {
      missing.push(varName);
    } else if (value.length < 10) { // Basic validation for min length
      invalid.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  if (invalid.length > 0) {
    throw new EnvironmentError(
      `Invalid environment variables (too short): ${invalid.join(', ')}\n` +
      'Please check that these variables have valid values.'
    );
  }

  // Additional specific validations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new EnvironmentError(
      'NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL (https://[project].supabase.co)'
    );
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL!;
  if (!nextAuthUrl.startsWith('http://') && !nextAuthUrl.startsWith('https://')) {
    throw new EnvironmentError(
      'NEXTAUTH_URL must be a valid URL starting with http:// or https://'
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    RAWG_API_KEY: process.env.RAWG_API_KEY!,
    NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  };
}

/**
 * Validates environment variables and logs helpful information
 * Should be called at application startup
 */
export function initializeEnvironment(): EnvConfig {
  try {
    const env = validateEnvironment();
    
    // Log successful initialization (without sensitive values)
    console.log('✅ Environment validation successful');
    console.log(`📦 Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`🔗 NextAuth URL: ${env.NEXTAUTH_URL}`);
    console.log(`🎮 RAWG API: ${env.RAWG_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`📺 Twitch API: ${env.NEXT_PUBLIC_TWITCH_CLIENT_ID ? 'Configured' : 'Missing'}`);
    
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail hard in production
    } else {
      console.warn('⚠️  Continuing in development mode with missing environment variables');
      // Return partial config for development
      return process.env as unknown as EnvConfig;
    }
  }
}

/**
 * Get environment variables with validation (for runtime use)
 */
export function getEnv(): EnvConfig {
  return validateEnvironment();
}