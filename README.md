This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Recommended: Deploy via Vercel Dashboard

The most reliable way to deploy this application is through the Vercel dashboard:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
6. Add the environment variables from `.env.local` to the Environment Variables section
7. Click "Deploy"

### Alternative: Manual Deployment with Vercel CLI

We've included a deployment script to make the process easier:

1. Run the deployment script:

   ```bash
   ./deploy.sh
   ```

2. The script will automatically install the Vercel CLI locally and guide you through the deployment process

3. Follow the prompts to log in and deploy your application

### Environment Variables

Make sure to set up the following environment variables in your Vercel project:

- `NEXT_PUBLIC_TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `NEXT_PUBLIC_API_BASE` (set to your production URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

- `NEXT_PUBLIC_RAWG_API_KEY`

You can set these in the Vercel dashboard under Project Settings > Environment Variables.
