const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.igdb.com", "media.rawg.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/igdb/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === "development",
  },
  reactStrictMode: true,
  // Add environment variables with default values for deployment
  env: {
    NEXT_PUBLIC_TWITCH_CLIENT_ID:
      process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "placeholder",
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE || "https://gamerfie.vercel.app",
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://aliybmsckpqrvkecumhp.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || "placeholder",
    NEXT_PUBLIC_RAWG_API_KEY:
      process.env.NEXT_PUBLIC_RAWG_API_KEY || "placeholder",
  },
};

// Temporarily disable Sentry to fix build issues
// module.exports = withSentryConfig(nextConfig, {
//   org: "jassin-al-safe",
//   project: "gamerfie",
//   authToken: process.env.SENTRY_AUTH_TOKEN,
//   silent: false,
// });

// Export the config directly without Sentry for now
module.exports = nextConfig;
