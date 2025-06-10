#!/bin/bash

# Deployment script for Vercel

# Install Vercel CLI locally if not already installed
if ! [ -d "node_modules/vercel" ]; then
    echo "Installing Vercel CLI locally..."
    npm install --save-dev vercel
fi

# Ensure we're logged in
echo "Checking Vercel login status..."
npx vercel whoami || npx vercel login

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment complete! Your app should be live on Vercel."
echo "Don't forget to set up your environment variables in the Vercel dashboard:"
echo "- NEXT_PUBLIC_TWITCH_CLIENT_ID"
echo "- TWITCH_CLIENT_SECRET"
echo "- NEXT_PUBLIC_API_BASE (set this to your production URL)"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_SENTRY_DSN"
echo "- NEXT_PUBLIC_RAWG_API_KEY" 