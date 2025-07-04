#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates that all required environment variables are properly configured
 */

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'RAWG_API_KEY',
  'NEXT_PUBLIC_TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AUTH_SECRET'
];

const optional = [
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_API_BASE'
];

console.log('🔍 Validating Environment Variables');
console.log('===================================\n');

let hasErrors = false;
const missing = [];
const present = [];
const weak = [];

// Check required variables
for (const varName of required) {
  const value = process.env[varName];
  
  if (!value) {
    missing.push(varName);
    hasErrors = true;
  } else {
    present.push(varName);
    
    // Check for weak secrets
    if ((varName.includes('SECRET') || varName.includes('KEY')) && value.length < 20) {
      weak.push(varName);
    }
  }
}

// Check optional variables
const optionalPresent = [];
const optionalMissing = [];

for (const varName of optional) {
  if (process.env[varName]) {
    optionalPresent.push(varName);
  } else {
    optionalMissing.push(varName);
  }
}

// Report results
if (present.length > 0) {
  console.log('✅ Required Variables Present:');
  present.forEach(name => {
    const value = process.env[name];
    const preview = name.includes('SECRET') || name.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value.length > 50 
        ? value.slice(0, 30) + '...' 
        : value;
    console.log(`   ✓ ${name}: ${preview}`);
  });
  console.log('');
}

if (missing.length > 0) {
  console.log('❌ Missing Required Variables:');
  missing.forEach(name => console.log(`   ✗ ${name}`));
  console.log('');
}

if (weak.length > 0) {
  console.log('⚠️  Weak Secrets Detected:');
  weak.forEach(name => console.log(`   ⚠ ${name} (length: ${process.env[name].length})`));
  console.log('   Recommendation: Use secrets with at least 32 characters');
  console.log('');
}

if (optionalPresent.length > 0) {
  console.log('📋 Optional Variables Present:');
  optionalPresent.forEach(name => console.log(`   ✓ ${name}`));
  console.log('');
}

if (optionalMissing.length > 0) {
  console.log('📝 Optional Variables Missing:');
  optionalMissing.forEach(name => console.log(`   - ${name}`));
  console.log('');
}

// Specific validations
console.log('🔧 Specific Validations:');

// Supabase URL validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  if (supabaseUrl.includes('.supabase.co') && supabaseUrl.startsWith('https://')) {
    console.log('   ✓ Supabase URL format is valid');
  } else {
    console.log('   ✗ Supabase URL format is invalid');
    hasErrors = true;
  }
}

// NextAuth URL validation
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.startsWith('http://') || nextAuthUrl.startsWith('https://')) {
    console.log('   ✓ NextAuth URL format is valid');
  } else {
    console.log('   ✗ NextAuth URL must start with http:// or https://');
    hasErrors = true;
  }
}

// Environment-specific checks
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && nextAuthUrl && nextAuthUrl.includes('localhost')) {
  console.log('   ⚠ NextAuth URL uses localhost in production');
}

console.log('');

// Final result
if (hasErrors) {
  console.log('❌ Environment validation failed!');
  console.log('Please fix the missing/invalid variables above.');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed!');
  console.log(`📊 Status: ${present.length}/${required.length} required variables configured`);
  
  if (weak.length > 0) {
    console.log('⚠️  Consider strengthening weak secrets for better security');
    process.exit(1);
  }
}