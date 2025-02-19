const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.igdb.com", "upload.wikimedia.org", "media.rawg.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.igdb.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: "jassin-al-safe",
  project: "gamerfie",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: false,
});
