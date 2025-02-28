# Deploying Gamerfie to Vercel

This guide provides step-by-step instructions for deploying the Gamerfie application to Vercel.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account with your Gamerfie code repository
- A Vercel account (you can sign up at [vercel.com](https://vercel.com))
- Your environment variables ready (from your `.env.local` file)

## Deployment Steps

### 1. Push Your Code to a Git Repository

Ensure your code is pushed to a Git repository on GitHub, GitLab, or Bitbucket.

### 2. Log in to Vercel

Go to [vercel.com/dashboard](https://vercel.com/dashboard) and log in to your account.

### 3. Create a New Project

1. Click on "Add New" and select "Project"
2. Import your Gamerfie repository
3. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

### 4. Configure Environment Variables

Add the following environment variables from your `.env.local` file:

| Name                            | Description                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_TWITCH_CLIENT_ID`  | Your Twitch API client ID                                        |
| `TWITCH_CLIENT_SECRET`          | Your Twitch API client secret                                    |
| `NEXT_PUBLIC_API_BASE`          | Your production API URL (e.g., https://your-app-name.vercel.app) |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key                                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Your Supabase service role key                                   |
| `NEXT_PUBLIC_SENTRY_DSN`        | Your Sentry DSN (for error tracking)                             |
| `NEXT_PUBLIC_RAWG_API_KEY`      | Your RAWG API key                                                |

### 5. Deploy

Click the "Deploy" button to start the deployment process.

### 6. Monitor Deployment

You can monitor the deployment progress in the Vercel dashboard. Once completed, Vercel will provide you with a URL to access your deployed application.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in the Vercel dashboard for specific error messages
2. Verify that all environment variables are correctly set
3. Ensure your code works locally before deploying
4. Check that your Next.js configuration is compatible with Vercel

## Updating Your Deployment

Any new commits pushed to your repository's main branch will automatically trigger a new deployment if you've set up the GitHub integration.

To manually redeploy:

1. Go to your project in the Vercel dashboard
2. Click on "Deployments"
3. Click "Redeploy" on the deployment you want to update

## Custom Domains

To set up a custom domain:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Domains"
3. Add your domain and follow the instructions to configure DNS settings
