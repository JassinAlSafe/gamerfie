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
  experimental: {
    // Remove the serverActions flag as it's now available by default
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
