#!/bin/bash

# Setup Vercel Environment Variables Script
# Run this script to set up all required environment variables in Vercel

echo "🚀 Setting up Vercel Environment Variables"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "📝 Please enter your Vercel domain (without https://):"
echo "Example: gamerfie.vercel.app or your-custom-domain.com"
read -p "Domain: " VERCEL_DOMAIN

if [ -z "$VERCEL_DOMAIN" ]; then
    echo "❌ Domain cannot be empty"
    exit 1
fi

echo ""
echo "🔧 Setting up environment variables..."

# Supabase Configuration (Critical)
vercel env add NEXT_PUBLIC_SUPABASE_URL production --value="https://aliybmsckpqrvkecumhp.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaXlibXNja3BxcnZrZWN1bWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzMzkzMTMsImV4cCI6MjA0NDkxNTMxM30.p_T9MjinSRa-c-0gOdQu9gr22H5pAhE5zEiqhpbY8_Q"
vercel env add SUPABASE_SERVICE_ROLE_KEY production --value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaXlibXNja3BxcnZrZWN1bWhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTMzOTMxMywiZXhwIjoyMDQ0OTE1MzEzfQ.Oi_2kTJhQpijVVHNhvFvzYi_u7GV0oLLPTZhzHQRBWE"

# External APIs
vercel env add RAWG_API_KEY production --value="cc1a77d6aacd4cecb5c2892d3f0591b1"
vercel env add NEXT_PUBLIC_TWITCH_CLIENT_ID production --value="wi3ma4jpl7mz5qp5wbg44xujau4il7"
vercel env add TWITCH_CLIENT_SECRET production --value="3gm4qal93oclcpmiihav4y96euw3hw"

# NextAuth Configuration with dynamic domain
vercel env add NEXTAUTH_URL production --value="https://$VERCEL_DOMAIN"
vercel env add NEXTAUTH_SECRET production --value="cyqMOX1jS3dZIsQje1mCS6TkNjagpOUSBtcB9x2p0VU="
vercel env add AUTH_SECRET production --value="TQcHlZbOFpK2IJr+FaXd11Na3ROAtZRrfRcVF2LZVP8="

# Optional Configuration
vercel env add NEXT_PUBLIC_API_BASE production --value="https://$VERCEL_DOMAIN"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Deploy your application: vercel --prod"
echo "2. Check your deployment at: https://$VERCEL_DOMAIN"
echo ""
echo "📋 Environment variables added:"
echo "   ✓ NEXT_PUBLIC_SUPABASE_URL"
echo "   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   ✓ SUPABASE_SERVICE_ROLE_KEY"
echo "   ✓ RAWG_API_KEY (server-side only)"
echo "   ✓ NEXT_PUBLIC_TWITCH_CLIENT_ID"
echo "   ✓ TWITCH_CLIENT_SECRET"
echo "   ✓ NEXTAUTH_URL (https://$VERCEL_DOMAIN)"
echo "   ✓ NEXTAUTH_SECRET"
echo "   ✓ AUTH_SECRET"
echo "   ✓ NEXT_PUBLIC_API_BASE"
echo ""
echo "🔐 Security notes:"
echo "   • RAWG_API_KEY is server-side only (no NEXT_PUBLIC_ prefix)"
echo "   • Strong secrets generated for NextAuth"
echo "   • All critical variables are configured"